from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
import datetime
import pandas as pd
import boto3
import json
import copy

app = Flask(__name__)
CORS(app)

# JWT Secret Key 
app.config["JWT_SECRET_KEY"] = "test1234"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = datetime.timedelta(hours=1)

jwt = JWTManager(app)

USERS_DB = {
    "admin": "admin1234",
    "user": "1234"
}

# AWS S3 Configuration
S3_BUCKET = "paynet-pohan"
S3_FILE = "crime_district_filtered.csv"

# Load Malaysia GeoJSON
with open("malaysia.geojson", "r") as f:
    base_geojson = json.load(f)

# Function to load dataset from AWS S3
def load_data():
    s3_client = boto3.client("s3")       
    obj = s3_client.get_object(Bucket=S3_BUCKET, Key=S3_FILE)
    df = pd.read_csv(obj["Body"])
    
    # Ensure date is datetime format
    df["date"] = pd.to_datetime(df["date"])
    df["year"] = df["date"].dt.year
    return df

# Login Endpoint (Returns JWT Token)
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    # Check credentials
    if username in USERS_DB and USERS_DB[username] == password:
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token), 200

    return jsonify({"error": "Invalid credentials"}), 401

# API 1: Get Crime Heatmap Data
@app.route("/crime-heatmap", methods=["GET"])
@jwt_required()
def crime_heatmap():
    df = load_data()

    # Get filters
    year = request.args.get("year")
    crime_type = request.args.get("type")

    # Apply filters
    if year:
        df = df[df["year"] == int(year)]
    if crime_type:
        df = df[df["type"] == crime_type]
    
    # Create a copy of the base GeoJSON (to prevent modification issues)
    geojson_data = copy.deepcopy(base_geojson)

    # Merge crime data into GeoJSON
    for feature in geojson_data["features"]:
        state_name = feature["properties"]["name"]
        
        # Find crime data for this state
        crime_entry = df[(df["state"] == state_name) & (df["district"] == "All")]

        # If state exists in crime data, update GeoJSON
        feature["properties"]["crimes"] = (
            int(crime_entry["crimes"].values[0]) if not crime_entry.empty else 0
        )

    return jsonify(geojson_data)

# API 2: Get Crime Trends Over Time
@app.route("/crime-trends", methods=["GET"])
def crime_trends():
    df = load_data()

    # Get filters from query parameters
    state = request.args.get("state")
    crime_type = request.args.get("type")

    # Apply filters
    if state:
        df = df[df["state"] == state]
    if crime_type:
        df = df[df["type"] == crime_type]

    # Group by date for trends
    trends = df.groupby("date")["crimes"].sum().reset_index()
    return jsonify(trends.to_dict(orient="records"))

@app.route("/api/filters", methods=["GET"])
def get_filters():
    df = load_data()
    states = df["state"].dropna().unique().tolist()
    types = df["type"].dropna().unique().tolist()
    return jsonify({"states": states, "types": types})

# API 3: Most Affected Districts
@app.route("/most-districts", methods=["GET"])
@jwt_required()
def crime_districts():
    df = load_data()
    
    # Get filters
    year = request.args.get("year")
    state = request.args.get("state")
    
    # Apply filters
    df = df[(df["year"] == int(year)) & (df["state"] == state)]
    df = df[df["district"] != "All"]
    df = df[df["type"] != "All"]
    
    # Pivot data so that crime types become separate columns, filling NaN with 0
    df_pivot = df.pivot_table(index="district", columns="type", values="crimes", aggfunc="sum").fillna(0)

    # Sort by total crimes (sum of all types)
    df_pivot["Total"] = df_pivot.sum(axis=1)
    df_pivot = df_pivot.sort_values(by="Total", ascending=False).drop(columns=["Total"])

    # Convert to dictionary format
    result = df_pivot.reset_index().to_dict(orient="records")

    return jsonify(result)

# API 4: Crime Breakdown by Type (With Filters)
@app.route("/crime-distribution", methods=["GET"])
@jwt_required()
def crime_types():
    df = load_data()

    # Get filters
    year = request.args.get("year")
    state = request.args.get("state")

    # Apply filters
    if year:
        df = df[df["year"] == int(year)]
    if state:
        df = df[df["state"] == state]

    # Group by crime type
    crime_distribution = df.groupby("type")["crimes"].sum().reset_index()
    
    return jsonify(crime_distribution.to_dict(orient="records"))

# API 5: Crime rate % change (YoY)
@app.route("/crime-rate-change", methods=["GET"])
def crime_rate_change():
    state = request.args.get("state", default=None)
    
    df = load_data()
    df = df[df["district"] == "All"]  # aggregate by state

    if state:
        df = df[df["state"] == state]

    yearly = df.groupby("year")["crimes"].sum().reset_index()
    yearly["percent_change"] = yearly["crimes"].pct_change() * 100
    yearly["percent_change"] = yearly["percent_change"].round(2)

    # Remove the first year (NaN percent_change)
    filtered = yearly[yearly["percent_change"].notna()]

    return jsonify(filtered.to_dict(orient="records"))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=True)
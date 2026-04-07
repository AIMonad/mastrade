from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS  # <-- IMPORT THIS
import os

app = Flask(__name__)

# --- NEW: Enable CORS ---
# This allows your Next.js frontend to talk to this API
CORS(app, resources={r"/*": {"origins": ["https://trade.flowmarket.io", "https://flowmarket.io"]}})

db_path = os.environ.get("DATABASE_URL", "sqlite:///data.db")
app.config["SQLALCHEMY_DATABASE_URI"] = db_path
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

class Trade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10))
    quantity = db.Column(db.Integer)
    price = db.Column(db.Float)

    def to_dict(self):
        return {"id": self.id, "symbol": self.symbol, "quantity": self.quantity, "price": self.price}

@app.cli.command("create-db")
def create_db_command():
    db.create_all()
    print("Database tables created successfully!")

# Added a health check - good for Traefik to verify the container is up
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"}), 200

# Note: I added /api to the routes to match your Traefik PathPrefix
@app.route("/api/trades", methods=["GET"])
def get_trades():
    trades = Trade.query.all()
    return jsonify([t.to_dict() for t in trades])

@app.route("/api/trades", methods=["POST"])
def add_trade():
    data = request.json
    t = Trade(symbol=data["symbol"], quantity=data["quantity"], price=data["price"])
    db.session.add(t)
    db.session.commit()
    return jsonify(t.to_dict()), 201

if __name__ == "__main__":
    # In Docker, you MUST listen on 0.0.0.0
    app.run(host="0.0.0.0", port=5000)
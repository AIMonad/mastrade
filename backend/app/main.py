from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
import os # Import os module

app = Flask(__name__)
# Use an environment variable for the database URI or provide a default
# This is good practice for deployment
db_path = os.environ.get("DATABASE_URL", "sqlite:///data.db")
app.config["SQLALCHEMY_DATABASE_URI"] = db_path
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False # Good practice to disable this

db = SQLAlchemy(app)

class Trade(db.Model):
 id = db.Column(db.Integer, primary_key=True)
 symbol = db.Column(db.String(10))
 quantity = db.Column(db.Integer)
 price = db.Column(db.Float)

 def to_dict(self):
     return {"id": self.id, "symbol": self.symbol, "quantity": self.quantity, "price": self.price}

# --- NEW: CLI command to create tables ---
@app.cli.command("create-db")
def create_db_command():
    """Creates the database tables."""
    db.create_all()
    print("Database tables created successfully!")
# --- END NEW ---

@app.route("/trades", methods=["GET"])
def get_trades():
 trades = Trade.query.all()
 return jsonify([t.to_dict() for t in trades])

@app.route("/trades", methods=["POST"])
def add_trade():
 data = request.json
 t = Trade(symbol=data["symbol"], quantity=data["quantity"], price=data["price"])
 db.session.add(t)
 db.session.commit()
 return jsonify(t.to_dict()), 201

# Removed: @app.before_first_request def create_tables(): ...

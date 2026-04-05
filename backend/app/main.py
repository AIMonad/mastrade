from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy

app = Flask(name)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///data.db"
db = SQLAlchemy(app)

class Trade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10))
    quantity = db.Column(db.Integer)
    price = db.Column(db.Float)

    def to_dict(self):
        return {"id": self.id, "symbol": self.symbol, "quantity": self.quantity, "price": self.price}

    @app.before_first_request
    def create_tables():
        db.create_all()

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
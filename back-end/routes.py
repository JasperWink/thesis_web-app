from app import app, db
from flask import request, jsonify
from models import Product

# Get all products
@app.route("/api/products", methods=["GET"])
def get_products():
    products = Product.query.all()
    result =  [product.to_json() for product in products]
    return jsonify(result)


# Create a product
@app.route("/api/products", methods=["POST"])
def create_product():
    try:
        data = request.json

        required_fields = ["name", "nutri_score"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error":f"Missing required field: {field}"}), 400

        name = data.get("name")
        # Maybe do nutri score dynamically with open food fact api
        nutri_score = data.get("nutri_score")

        new_product = Product(name=name, nutri_score=nutri_score)
        db.session.add(new_product)
        db.session.commit()

        return jsonify({"msg":"Succesfully added product"}), 201

    # Handle the error
    except Exception as e:
        db.session.rollback()
        return jsonify({"error":str(e)}), 500


# Delete a product
@app.route("/api/products/<int:id>", methods=["DELETE"])
def delete_product(id):
    try:
        product = Product.query.get(id)
        if product is None:
            return jsonify({"error":"Product not found"}), 404

        db.session.delete(product)
        db.session.commit()
        return jsonify({"msg":"Product deleted"}), 200

    # Handle the error
    except Exception as e:
        db.session.rollback()
        return jsonify({"error":str(e)}), 500


# Update a product
@app.route("/api/products/<int:id>", methods=["PATCH"])
def update_product(id):
    try:
        product = Product.query.get(id)
        if product is None:
            return jsonify({"error":"Product not found"}), 404

        data = request.json

        product.name = data.get("name", product.name)
        product.nutri_score = data.get("nutri_score", product.nutri_score)

        db.session.commit()
        return jsonify(product.to_json()), 200

    # Handle the error
    except Exception as e:
        db.session.rollback()
        return jsonify({"error":str(e)}), 500

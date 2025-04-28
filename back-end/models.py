from app import db


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    nutri_score = db.Column(db.String(10), nullable=False)


    def  to_json(self):
        return {
            "id":self.id,
            "name":self.name,
            "nutri_score":self.nutri_score,
        }

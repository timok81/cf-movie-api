const jwtSecret = "your_jwt_secret";

import { sign } from "jsonwebtoken";
import { authenticate } from "passport";

import "./passport";

let generateJWTToken = (user) => {
  return sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: "7d",
    algorithm: "HS256",
  });
};

/**
 * @description Login user
 * @example
 * Authentication: None
 * @name POST /login
 * @example
 * Request data format
 * {
 *  "Username": "",
 *  "Password": ""
 * }
 * @example
 * Response data format
 * {
 *   user: {
 *     "_id": ObjectID,
 *     "Username": "",
 *     "Password": "",
 *     "Email": "",
 *     "Birthday": "",
 *     "FavoriteMovies": [ObjectID]
 *   },
 *   token: ""
 * }
 */
export default (router) => {
  router.post("/login", (req, res) => {
    authenticate("local", { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: "Something is not right",
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};

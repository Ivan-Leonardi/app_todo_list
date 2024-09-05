import mysqlConnection from "../../database/mysql/mysqlConnect.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authConfig from "../../config/auth.js";

dotenv.config();

class UserLoginController {
  async create(req, res) {
    const { email, password } = req.body;

    const database = mysqlConnection;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email e senha obrigatórios",
      });
    }

    try {
      const [user] = await database.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (user.length === 0) {
        return res.status(400).json({ message: "Usuário não encontrado" });
      }

      const userFound = user[0];

      const isValidPassword = await bcrypt.compare(
        password,
        userFound.password
      );

      if (!isValidPassword) {
        return res.status(401).json({
          message: "Email ou senha incorreto!",
        });
      }

      const { secret, expiresIn } = authConfig.JWT;

      const token = jwt.sign({}, secret, {
        subject: String(userFound.id),
        expiresIn,
      });
      
      return res.status(200).json({
        message: "Login realizado com sucesso",
        userFound,
        token,
      });
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return res.status(500).json({ error: "Erro ao fazer login" });
    }
  }
}

export default UserLoginController;

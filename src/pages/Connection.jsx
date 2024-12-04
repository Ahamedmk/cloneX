import { useState, useContext, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../store/AuthProvider";

import "./connection.css"; // Importer le fichier CSS

export default function Connection() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { loginUser, newUser, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (user) {
      console.log("Utilisateur connecté, redirection en cours...");
      // if (newUser) {
        navigate("/?success=true");
      // } else {
      //   navigate("/journal");
      // }
    }
  }, [user, newUser, navigate]);

  const onSubmit = async (data) => {
    if (localLoading) return;

    setLocalLoading(true);

    try {
      console.log("Tentative de connexion avec", data.email);
      await loginUser(data.email, data.password);
      console.log("Utilisateur connecté avec succès");
      // Le useEffect se chargera de la redirection
    } catch (error) {
      console.error("Erreur lors de la connexion :", error);
      const { code } = error;

      // Gestion des erreurs de connexion
      if (code === "auth/user-not-found") {
        toast.error("Cet email n'est pas utilisé.");
      } else if (code === "auth/wrong-password") {
        toast.error("Mot de passe incorrect.");
      } else {
        toast.error("Erreur lors de la connexion.");
      }
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="connection-page">
      <h1 className="text-center connection-title">Connexion</h1>
      <div className="shadow bg-body mx-auto mt-4 px-4 py-4 w-75 border rounded connection-form">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Adresse mail</Form.Label>
            <Form.Control
              type="email"
              placeholder="Entrez votre email"
              {...register("email", {
                required: "L'email est requis.",
                pattern: {
                  value:
                    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Renseignez une adresse valide.",
                },
              })}
              className="form-control-custom"
            />
            {errors.email && (
              <p className="text-danger">{errors.email.message}</p>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Mot de passe</Form.Label>
            <Form.Control
              type="password"
              placeholder="Entrez votre mot de passe"
              {...register("password", {
                required: "Le mot de passe est requis.",
                minLength: {
                  value: 8,
                  message:
                    "Le mot de passe doit contenir au moins 8 caractères.",
                },
              })}
              className="form-control-custom"
            />
            {errors.password && (
              <p className="text-danger">{errors.password.message}</p>
            )}
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100 connection-button"
            disabled={localLoading}
          >
            {localLoading ? "Connexion en cours..." : "Se connecter"}
          </Button>
        </Form>

        <Link to="/inscription">
          <Button
            variant="success"
            className="mx-auto mt-4 w-100 create-account-button"
          >
            Créer un compte
          </Button>
        </Link>
      </div>
    </div>
  );
}

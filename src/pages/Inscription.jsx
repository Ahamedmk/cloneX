import "./inscription.css";
import { useState, useContext } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthContext } from "../store/AuthProvider";

export default function Inscription() {
  // Hook pour le formulaire
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  
  // Utilisation du contexte Auth
  const { createUser,logOut } = useContext(AuthContext);

  // State pour gérer le chargement
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    if (loading) return;

    setLoading(true);

    try {
      // Crée un utilisateur avec le nom d'utilisateur
      await createUser(data.email, data.password, data.username);
      
      toast.success("Inscription réussie. Veuillez vous connecter.");
      navigate("/"); // Redirige vers la page de connexion
    } catch (error) {
      setLoading(false);
      const { code } = error;
      if (code === "auth/email-already-in-use") {
        toast.error("Cet email est déjà utilisé.");
      } else {
        toast.error("Erreur d'inscription.");
      }
    }
  };

  return (
    <div className="inscription-page">
      <h1 className="text-center inscription-title">Inscription</h1>
      <div className="shadow bg-body mx-auto mt-4 px-4 py-4 w-75 border rounded inscription-form">
        <Form onSubmit={handleSubmit(onSubmit)}>
          {/* Champ Nom d'utilisateur */}
          <Form.Group className="mb-3" controlId="formBasicUsername">
            <Form.Label>Nom d'utilisateur</Form.Label>
            <Form.Control
              type="text"
              placeholder="Entrez votre nom d'utilisateur"
              {...register("username", {
                required: "Le nom d'utilisateur est requis.",
                minLength: {
                  value: 3,
                  message:
                    "Le nom d'utilisateur doit contenir au moins 3 caractères.",
                },
              })}
              className="form-control-custom"
            />
            {errors.username && (
              <p className="text-danger">{errors.username.message}</p>
            )}
          </Form.Group>

          {/* Champ Email */}
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Adresse mail</Form.Label>
            <Form.Control
              type="email"
              placeholder="Entrez votre email"
              {...register("email", {
                required: "L'email est requis.",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Renseignez une adresse valide.",
                },
              })}
              className="form-control-custom"
            />
            {errors.email && (
              <p className="text-danger">{errors.email.message}</p>
            )}
          </Form.Group>

          {/* Champ Mot de passe */}
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
            className="w-100 inscription-button"
            disabled={loading}
          >
            {loading ? "Inscription en cours..." : "S'inscrire"}
          </Button>
        </Form>

        <div className="text-center pt-3">
          <Link to="/connection" className="inscription-link">
            Déjà un compte ?
          </Link>
        </div>
      </div>
    </div>
  );
}

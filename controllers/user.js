//---- Packages ----//

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const passwordValidator = require('password-validator');

// Create a schema
const schema = new passwordValidator();

// Add properties to it
schema
    .is().min(8)                                    // Minimum length 8
    .is().max(100)                                  // Maximum length 100
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits(2)                                // Must have at least 2 digits
    .has().not().spaces()                           // Should not have spaces
    .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

//---- middleware pour s'inscrire ----//

exports.signup = (req, res, next) =>{
    if (!schema.validate(req.body.password)){
        return res.status(400).json({ message: 'Mot de passe non valide, votre mot de passe doit contenir au moins 8 caractères, dont une majuscule et au minimum 2 chiffres !'})
    }
    bcrypt.hash( req.body.password , 10)
        .then( hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !'}))
                .catch(error => res.status(400).json({error}));
        })
        .catch(error => res.status(500).json({error}));
};

//---- middleware de connexion ----//

exports.login = (req, res, next) =>{
    User.findOne({ email: req.body.email})
        .then(user => {
            if (!user){
                return res.status(401).json({ message: 'Utilisateur non trouvé'})
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid =>{
                    if (!valid){
                        return res.status(401).json({ message: 'Mot de passe incorrect'});
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            {userId: user._id},
                            'RANDOM_TOKEN_SECRET',
                            {expiresIn: '24h'}
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};
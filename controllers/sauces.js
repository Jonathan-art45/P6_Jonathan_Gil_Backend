//---- Packages ----//

const Sauce = require("../models/sauces");
const fs = require('fs');

//-------------------------- Logique métier --------------------------//

//---- middleware de création de sauce ----//

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        ...sauceObject,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json({message: 'La sauce a bien été enregistré !'}))
        .catch(error => res.status(400).json({error}));

};

//---- middleware de modification de sauce ----//

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : {...req.body};
    Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
        .then(() => res.status(200).json({message: 'La sauce a bien été modifié !'}))
        .catch(error => res.status(404).json({error}));
};

//---- middleware de suppression de sauce ----//

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({_id: req.params.id})
                    .then(() => res.status(200).json({message: 'La sauce a bien été supprimé'}))
                    .catch(error => res.status(400).json({error}));
            })
        })
        .catch(error => res.status(500).json({error}));
};

//---- middleware de sélection d'une sauce de sauce ----//

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({error}));
};

//---- middleware de sélection de toutes les sauces ----//

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({error}));
};

//---- middleware de like et dislike des sauces ----//

exports.postLikeSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then(sauce => {
            console.log(sauce);
            console.log(req.body.like);
            switch (req.body.like) {
                case 1:
                    Sauce.updateOne({ _id: req.params.id }, {
                        _id: req.params.id,
                        $inc: { likes: + req.body.like },
                        $push: { usersLiked: req.body.userId },
                    })
                        .then(() => res.status(201).json({message: "Like enregistré !"}))
                        .catch(error => res.status(400).json({error}));
                    break;
                case 0 :
                    if (sauce.usersLiked.includes(req.body.userId)) {
                        Sauce.updateOne(
                            {_id: req.params.id},
                            {$pull: {usersLiked: req.body.userId},$inc: {likes: -1}}
                        )
                            .then(() => res.status(200).json({message: 'un like retiré !'}))
                            .catch((error) => res.status(400).json({error}))
                    }
                    if (sauce.usersDisliked.includes(req.body.userId)) {
                        Sauce.updateOne(
                            {_id: req.params.id},
                            {$pull: {usersDisliked: req.body.userId}, $inc: {dislikes: -1}}
                        )
                            .then(() => res.status(200).json({message: 'un dislike retiré !'}))
                            .catch((error) => res.status(400).json({error}))
                        console.log("null");
                    }
                    res.status(200).json({message : "ok"});
                    break;
                case -1:
                    Sauce.updateOne({ _id: req.params.id }, {
                        _id: req.params.id,
                        $inc: { dislikes: + req.body.like * -1 },
                        $push: { usersDisliked: req.body.userId },
                    })
                        .then(() => res.status(201).json({message: "Dislike enregistré !"}))
                        .catch(error => res.status(400).json({error}));
                    break;
            }
        })
};
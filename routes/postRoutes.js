const express = require('express');
const router = express.Router();

router.get("/:id", (req, res, next) => {

    let payload = {
        pageTitle: "View post",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        postId: req.params.id
    }
    
    res.status(200).render("postPage", payload);
})

module.exports = router;
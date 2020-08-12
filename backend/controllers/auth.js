const User = require('../models/user');
const Blog = require('../models/blog');
const shortId = require('shortid');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const { errorHandler } =require('../helpers/dbErrorHanlder');
const _= require('loadash');
const { OAuth2Client } = require('google-auth-library');
// send gtrid 
const sgMail = require('@sendgrid/mail'); 
sgMail.setApiKey(process.env.SENDGRID_API_KEY); 

exports.preSignup = (req, res ) => {
    const { name, email, password } = req.body;
    User.findOne({ email: email.toLowerCase() }, (err, user) => {
        if (user) {
            return res.status(400).json({
                error: 'Email is busy';
            });
        }
        const token = jwt.sign ({
            name, email, password 
        }, process.env.JWT_ACCOUNT_ACTIVATION, {expiresIn: '20m' });
        const emailData = {
            from: process.env.EMAIL_FROM, 
            to: email,
            subject: `Account activation link here`,
            html: 
            <p>Hello friend the following link to activate your account: </p>
            <p> ${process.env.CLIENT_URL}/auth/account/activate/${token}</p>
            <hr />
            <p>This email is for you join us and start blogging</p>
            <p>${APP_NAME}</p>
        };
        sgMail.send(emailData).then(sent => {
            return res.json({
                message: `Email sended to ${email}. Follow the instructions to activate`;
            });
        });
    });
};
exports.signup = ( req, res ) => {
    const token = req.body.token;
    if (token) {
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, 
            function(err, decoded) {
                if (err) {
                    return res.status(401).json({
                        error: 'Expired link. SignUp Again ahmaq'
                    });
                }
                
                const { name, email, password } = jwt.decode(token);

                let username = shortId.generate();
                let profile = `${process.env.CLIENT_URL}/profile/${username}`;

                const user =  new User({ name, email, password, profile, username });
                user.save((err, user ) => {
                    if (err) {
                        return res.status(401).json({
                            error: errorHandler(err);
                        });
                    }
                    return res.json({
                        message: 'SignUp succes! I wish u with AMAZING HARD JOB, and now u need to Sign In';
                    });
                });
            });
    } else  {
        return res.json({
            message: 'Something went wronggg ohh I know ur dirty secret ur little dirty secret';
        });
    }
};

exports.signin = ( req, res ) => {
    const { email, password } = req.body;
    // if user exist kofta gashtois
    User.findOne({ email }).exec(( err, user ) => {
        if ( err || !user ) {
            return res.status(400).json({
                error: 'I know ur secret ur dirty secret is plz signup ur account doesnt exist in our database go out baby';
            });
        }
        // authenticate 
        if ( !user.authenticate(password)) {
            return res.status(400).json({
                error: 'Email and Password dnt match'
            });
        }
        // generate a token
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: 'id' });

        res.cookie('token', token, { expiresIn: '2d' });
        const { _id, username, name, email, role } = user;
        return res.json({
            token, 
            user: { _id, username, name, email, role }
        });
    });
};
exports.signout = ( req, res ) => {
    res.clearCookie('token');
    re.json({
        message: 'Sign Out Success';
    });
};

// plz sign in
exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET 
});
express.authMiddleware = (req, res, next ) => {
    const authUserId = req.user._id;
    User.findById({ _id: authUserId }).exec(( err, user ) => {
        if (err || !user ){
            return res.status(400).json({
                error: 'PLZ sign up'
            });
        }
        req.profile = user; 
        next();
    });
};

// middlewarwe 
exports.adminMiddleware = ( req, res, next ) => {
    const adminUserId = req.user._id; 
    User.findById({ _ id: adminUserId }).exec((err, user ) => {
        if (err | !user ) {
            return res.status(400).json({
                error: 'PLZ sign Up'
            });
        }

        if (user.role !== 1 ) {
            return res.status(400).json({
                error: 'Admin Resource.acces denied bye!';
            });
        }
        req.profile = user; 
        next(); 
    });
};

exports.canUpdateDeleteBlog = ( req, res, next ) => {
    const slug = req.params.slug.toLowerCase(); 
    Blog.findOne({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler(err)
            });
        }
        let authorizedUser = data.postedBy._id.toString() === req.profile._id.toString();
        if (!authorizedUser) {
            return res.status(400).json({
                error: 'U have an account sign in';
            });
        }
        next(); 
    });
};

exports.forgotPassword = ( req, res ) => {
    const { email } = req.body; 

    User.findOne({ email }, (err, user) => {
        if (err || !user ) {
            return res.status(401).json({
                error: 'User with that email doesn`t exist'; 
            });
        }

        const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, { expiresIn: '20m' });
        // email 

        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email, 
            subject: 'Reset your password with' , 
            html: 
            <p>Please use the following link to reset your password:</p>
            <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>{APP_NAME}</p>
        };
        // db>user>resetpasww
        return user.updateOne({ resetPasswordLink: token }, (err, success) =>{
            if (err) {
                return res.json({ error: errorHandler(err) });
            } else {
                sgMail.send(emailData).then(sent => {
                    return res.json({
                        message: `Email has been sent to ${email}. Follow instruction to reset your password`; 
                    });
                });
            }
        });
    });
};

// reset password 

exports.resetPassword = ( req, res ) => {
    const { resetPasswordLink, newPassword } = req.body;

    if (resetPasswordLink) {
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function(err, decoded) => {
            if (err) {
                return res.status(401).json({
                    error: 'Expired Link. PLZ try Again'
                });
            }
            USer.findOne({ resetPasswordLink }, ( err, user ) => {
                if (err || !user ){
                    return res.status(401).json({
                        error: 'Something went wrong. Try Later' 
                    });
                }
                const updatedFields = {
                    password: newPassword, 
                    resetPasswordLink: ''
                };
                user = _.extend( user, updatedFields ); 

                user.save((err, result ) => {
                    if (err) {
                        return res.status(400).json({
                            error: errorHandler(err)
                        });
                    }
                    res.json({
                        message: `Great!`
                    });
                });
            });
        });
    }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleLogin = ( req, res ) => {
    const idToken = req.body.tokenId;
    client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID }).then(response => {
        const { email_verified, name, email, jti } = response.payload; 
        if (email_verified) {
            User.findOne({ email }).exec((err, user) => {
                if (user) {
                    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: 'id' });
                    res.cookie('token', token, {expiresIn: '1d' });
                    const { _id, email, name, role, username } = user; 
                    return res.json({ token, user: { _id, email, name, role, username}});
                } else {
                    let username = shortId.generate();
                    let profile = `${process.env.CLIENT_URL}/profile/${username}`;
                    let password = jti; 
                    user = new User({ name, email, profile, username, password });
                    user.save((err, data ) => {
                        if (err) {
                            return res.status(400).json({
                                error: errorHandler(err)
                            });
                        }
                        const token = jwt.sign({ _id: data._id }, process.env.JWT_SECRET, {expiresIn: 'id' });
                        res.cookie('token', token, { expiresIn: 'id' });
                        const { _id, email, name, role, username } = data;
                        return res.json({ token, user: { _id, email, name, role, username }});
                    });
                }
            });
        } else {
            return res.status(400).json({
                error: 'Google loginfailed go back. '
            });
        }
    });
};
const isLogin = async (req, res, next) => {
    try {
       if (req.session.user_id) {
           return next(); //  Proceed to the next middleware
       } 
       res.redirect('/login'); //  Redirect if not logged in
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error"); // Optional: Handle errors properly
    }
};


const isLogout = async (req, res, next) => {
    try {
       if (req.session.user_id) {
           return res.redirect('/table-view'); //  Exit function after redirect
       } 
       next(); //  Proceed only if the user is NOT logged in
    } 
    catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error"); // Optional: Proper error handling
    }
};

const isAdmin = async (req, res, next) => {
    try {
        if (!req.session.user || req.session.user.role !== "admin") {
            return res.redirect('/userDashboard'); // If not logged in or not admin, go to login
        } 
        next(); // Allow access if  user is admin
    } 
    catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};



module.exports = { 
    isLogin,
    isLogout,
    isAdmin

};
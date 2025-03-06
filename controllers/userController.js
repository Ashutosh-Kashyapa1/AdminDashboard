const express = require('express');
const mongoose = require('mongoose');
// const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const multer = require("multer");
// const Sample = require('../models/leadSampleModel'); 
const UserList=require('../models/userModel')
// const Sample = require('../models/employeModel'); 
const nodemailer = require('nodemailer')
const ejs = require('ejs');
const storage = multer.memoryStorage(); // Store file in memory as buffer
const upload = multer({ storage: storage });
const { Op } = require('sequelize');
const { User, Sample } = require('../models/associations'); // Use Sample instead







exports.userSignup = async (req, res) => {
    try {
        console.log("Received Data:", req.body);

        const newUser = {
            name: req.body.fname,
            email: req.body.femail,
            password: req.body.fpass,
            role: "user", // Default role is user
        };

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email: newUser.email } });
        if (existingUser) {
            return res.status(400).json({ status: "error", message: "User already exists, please choose another email." });
        }

        // Check password confirmation
        if (req.body.fpass === req.body.fcpass) {
            const hashedPassword = await bcrypt.hash(newUser.password, 10);
            newUser.password = hashedPassword;

            // Save user using Sequelize
            await User.create(newUser);

            return res.status(200).json({ status: "success", message: "User added Successfully" });
        } else {
            return res.status(400).json({ status: "error", message: "Passwords do not match" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.getSignupForm = async (req, res) => {
    
    res.render("register");
};

exports.getLoginForm = async (req, res) => {
    
    res.render("login");
};

exports.userViews = async (req, res) => {
    try {
        console.log("Params:", req.params.id);
        const { id } = req.params;

        // Ensure ID is a valid number (Sequelize uses numeric IDs)
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        // Find user by ID
        const response = await User.findByPk(id);

        if (!response) {
            return res.status(404).json({ error: "Data not found" });
        }

        // Render the EJS template with user data
        res.render("userViews", { response });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const id = req.params.id; // Extract the ID from URL parameter

        // Ensure ID is a valid integer (since Sequelize uses numeric IDs)
        if (isNaN(id)) {
            return res.status(400).json({ status: "error", message: "Invalid ID format" });
        }

        // Extract data from request body
        const updateFields = {
            created_at: req.body.fcreated_at,
            name: req.body.fname,
            email: req.body.fcontact_email,
            role: req.body.frole,
            status: req.body.fstatus,
            assign: req.body.fassign,
        };

        // Remove undefined fields
        Object.keys(updateFields).forEach((key) => {
            if (updateFields[key] === undefined) {
                delete updateFields[key];
            }
        });

        // Update the user in the database
        const [updatedRows] = await User.update(updateFields, {
            where: { id: id },
        });

        if (updatedRows === 0) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        // Fetch the updated record manually
        const updatedItem = await User.findByPk(id);

        console.log("User updated successfully:", updatedItem);
        return res.status(200).json({ status: "success", message: "User updated successfully", data: updatedItem });

    } catch (error) {
        console.error("Error updating user:", error.message);
        res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};
exports.sendEmail = async (req, res) => {
    try {
      let fromEmail = req.body.ffremail;
      let toEmail = req.body.ftoemail;
      let ccEmail = req.body.fccemail;
      let subject = req.body.fsubject;
      let message = req.body.ftextarea; // HTML message from Quill
  
      let ccEmailList = ccEmail ? ccEmail.split(/\s+/).map(email => email.trim()).filter(email => email !== "") : [];
  
      if (!toEmail || !subject || !message) {
        return res.status(400).json({ status: "error", message: "Missing required fields" });
      }

      const emailTemplatePath = path.join(__dirname, "../views/emailTemplate.ejs");

      const emailHtml = await ejs.renderFile(emailTemplatePath, { 
        recipientEmail: toEmail,
        senderEmail: fromEmail,
        subject: subject,
        message: message,
        currentYear: new Date().getFullYear(),
      });
  
  
      // Nodemailer Transport
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        requireTLS: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
  
      // Email Options
      const mailOptions = {
        from: fromEmail,
        to: toEmail,
        cc: ccEmailList,
        subject: subject,
        html: emailHtml, // Send formatted message
      };
  
      if (req.file) {
        mailOptions.attachments = [{
          filename: req.file.originalname,
          content: req.file.buffer,
        }];
      }
  
      // Send Email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ status: "error", message: "Failed to send email." });
        } else {
          console.log("Email sent successfully:", info.response);
          return res.status(200).json({ status: "success", message: "Email sent successfully!" });
        }
      });
  
    } catch (error) {
      console.error(error);
      return res.status(500).json({ status: "error", message: "Internal server error" });
    }
  };
  
  exports.dataView = async (req, res) => {
    try {
        console.log('Params:', req.params.id);
        const { id } = req.params;

        // Validate ID (ensure it's a number or UUID depending on your setup)
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        // Fetch data using Sequelize
        const response = await Sample.findByPk(id);
        
        if (!response) {
            return res.status(404).json({ error: "Data not found" });
        }

        // Render view with retrieved data
        res.render('dataViews', { response });

    } catch (error) {
        console.error("Error fetching data view:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getViews = async (req, res) => {
    try {
        console.log('Params:', req.params.id);
        const { id } = req.params;

        // Check if the ID is a valid number (if using UUID, adjust accordingly)
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        // Find record by primary key
        const response = await Sample.findByPk(id);

        if (!response) {
            return res.status(404).json({ error: "Data not found" });
        }

        res.render('views', { response });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.userLogin = async (req, res) => {
    try {
        const user = await User.findOne({ where: { email: req.body.email } });

        if (!user) {
            return res.status(401).json({ status: "error", message: "User does not exist" });
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ status: "error", message: "Wrong password" });
        }

        // Store session data
        req.session.user_id = user.id;
        req.session.user = { 
            id: user.id, 
            email: user.email, 
            role: user.role, 
            status: user.status, 
            name: user.name 
        };

        return res.status(200).json({ 
            status: "success",
            message: "Login successful",
            user: { email: user.email, role: user.role, status: user.status }
        });

    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

exports.getPagination = async (req, res) => { 
    try {
        console.log("Request query received:", req.query); 
        let page = parseInt(req.body.page) || 1;
        let limit = parseInt(req.body.limit) || 10;
        if (limit === -1) limit = null; // Set to `null` for no limit
        let offset = (page - 1) * (limit || 1);
        let draw = parseInt(req.body.draw) || 1;
        let search = req.body.search || '';
        let categories = req.body.category || [];
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;

        console.log("Testing body request =>", JSON.stringify(req.body));

        // Ensure categories is always an array
        if (typeof categories === "string") {
            categories = categories.split(",").map(cat => cat.trim());
        }

        let whereCondition = {};

        // Apply search filter
        if (search) {
            whereCondition[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { short_description: { [Op.like]: `%${search}%` } }
            ];
        }

        // Apply category filter
        if (categories.length > 0) {
            whereCondition.categories = { [Op.or]: categories.map(cat => ({ [Op.like]: `%${cat}%` })) };
        }
        // Apply date filter
        console.log("Received start_date:", start_date);
        console.log("Received end_date:", end_date);
        if (start_date && end_date) {
            whereCondition.createdAt = {
                [Op.between]: [new Date(start_date), new Date(new Date(end_date).setHours(23, 59, 59, 999))]
            };
        } else if (start_date) {
            whereCondition.createdAt = { [Op.gte]: new Date(start_date) };
        } else if (end_date) {
            whereCondition.createdAt = { [Op.lte]: new Date(new Date(end_date).setHours(23, 59, 59, 999)) };
        }

        console.log("Final Query:", JSON.stringify(whereCondition, null, 2));

        // Fetch paginated data
        let { rows: data, count: totalDocuments } = await Sample.findAndCountAll({
            where: whereCondition,
            limit,
            offset
        });

        // Send response
        res.json({
            draw: draw,  
            recordsTotal: totalDocuments, 
            recordsFiltered: totalDocuments, 
            data: data
        });

    } catch (error) {
        console.error("Error fetching paginated data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.getTableView = async (req, res) => { 
    if (!req.session.user) {
        return res.redirect("/login"); // Redirect to login if not logged in
    }
    res.render("tables",{ username: req.session.user.name });
};

exports.getUserDashboard = async (req, res) => { 
    if (!req.session.user) {
        return res.redirect("/login"); // Redirect to login if not logged in
    }

    res.render("userDashboard", { username: req.session.user.name }); 
};


exports.getUserData = async (req, res) => {
    try {
        console.log("Request query received", req.query);

        // Check if the user is logged in
        if (!req.session.user) {
            return res.status(401).json({ status: "error", message: "Unauthorized access" });
        }

        const loggedInUser = req.session.user; // Get session user
        let page = parseInt(req.body.page) || 1;
        let limit = parseInt(req.body.limit) || 10;
        if (limit === -1) limit = null; // Sequelize uses `null` for no limit
        let offset = (page - 1) * (limit || 0);
        let draw = parseInt(req.body.draw) || 1;
        let search = req.body.search || "";
        let categories = req.body.category || [];
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;

        // Ensure categories is always an array
        if (typeof categories === "string") {
            categories = categories.split(",").map(cat => cat.trim());
        }

        // Build where condition
        let whereCondition = {};

        // Apply search filter
        if (search) {
            whereCondition[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { short_description: { [Op.like]: `%${search}%` } }
            ];
        }

        // Apply category filter
        if (categories.length > 0) {
            whereCondition.categories = { [Op.or]: categories.map(cat => ({ [Op.like]: `%${cat}%` })) };
        }

        // Apply date filter
        if (start_date && end_date) {
            whereCondition.createdAt = {
                [Op.between]: [new Date(start_date), new Date(new Date(end_date).setHours(23, 59, 59, 999))]
            };
        } else if (start_date) {
            whereCondition.createdAt = { [Op.gte]: new Date(start_date) };
        } else if (end_date) {
            whereCondition.createdAt = { [Op.lte]: new Date(new Date(end_date).setHours(23, 59, 59, 999)) };
        }

        // Apply session-based filtering (non-admin users)
        if (loggedInUser.role !== "admin") {
            whereCondition.created_by = loggedInUser.id;
        }

        console.log("Final Query Conditions:", JSON.stringify(whereCondition, null, 2));

        // Fetch paginated data with `status` from the `user` table
        let { rows: data, count: totalRecords } = await Sample.findAndCountAll({
            where: whereCondition,
            offset: offset,
            limit: limit,
            include: [
                {
                    model: User,
                    as: "userDetails", // Ensure this matches `LeadSample.belongsTo(User, { as: "userDetails" })`
                    attributes: ["status"]
                }
            ]
        });
        

        // Format the data to include `status`
        data = data.map(item => ({
            ...item.toJSON(),
            status: item.userDetails ? item.userDetails.status : null
        }));

        // Send response
        res.json({
            draw: draw,
            recordsTotal: totalRecords,
            recordsFiltered: totalRecords,
            data: data
        });

    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};


exports.getUserList= async (req,res)=>{
    res.render('userList')
}


exports.importUser = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload an .xlsx file." });
        }

        if (!req.session.user) {
            return res.status(400).json({ error: "Unauthorized. Please log in." });
        }

        console.log("Session User:", req.session.user);
        const userId = req.session.user.id;
        console.log("User ID Type:", typeof userId, "User ID Value:", userId);

        const filePath = req.file.path;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(filePath);
        const worksheet = workbook.worksheets[0];

        let samples = [];
        let duplicateEntries = [];

        // Fetch existing user_ids from the database
        const existingRecords = await Sample.findAll({ attributes: ["user_id"], raw: true });
        let existingUserIds = new Set(existingRecords.map(record => record.user_id));

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber !== 1) { // Skip header row
                let user_id = row.getCell(1).value || '';

                if (user_id && !existingUserIds.has(user_id)) {
                    samples.push({
                        user_id,
                        sheet_created_at: row.getCell(2).value || '',
                        name: row.getCell(3).value || '',
                        short_description: row.getCell(4).value || '',
                        semrush_global_rank: parseFloat(row.getCell(5).value) || 0,
                        semrush_visits_latest_month: parseFloat(row.getCell(6).value) || 0,
                        num_investors: parseInt(row.getCell(7).value) || 0,
                        funding_total: parseFloat(row.getCell(8).value) || 0,
                        num_exits: parseInt(row.getCell(9).value) || 0,
                        num_funding_rounds: parseInt(row.getCell(10).value) || 0,
                        last_funding_type: row.getCell(11).value || '',
                        last_funding_at: row.getCell(12).value ? new Date(row.getCell(12).value) : null,
                        num_acquisitions: parseInt(row.getCell(13).value) || 0,
                        apptopia_total_apps: parseInt(row.getCell(14).value) || 0,
                        apptopia_total_downloads: parseFloat(row.getCell(15).value) || 0,
                        contact_email: (row.getCell(16).hyperlink || row.getCell(16).text || row.getCell(16).value || '').toString(),
                        phone_number: row.getCell(17).value || '',
                        facebook: row.getCell(18).hyperlink || row.getCell(18).value || '',
                        linkedin: row.getCell(19).hyperlink || row.getCell(19).value || '',
                        twitter: row.getCell(20).hyperlink || row.getCell(20).value || '',
                        num_investments: parseInt(row.getCell(21).value) || 0,
                        num_lead_investments: parseInt(row.getCell(22).value) || 0,
                        num_lead_investors: parseInt(row.getCell(23).value) || 0,
                        listed_stock_symbol: row.getCell(24).value || '',
                        company_type: row.getCell(25).value || '',
                        hub_tags: row.getCell(26).value || '',
                        operating_status: row.getCell(27).value || '',
                        founded_on: row.getCell(28).value ? new Date(row.getCell(28).value) : null,
                        categories: row.getCell(29).value || '',
                        founders: row.getCell(30).value || '',
                        website: row.getCell(31).hyperlink || row.getCell(31).value || '',
                        ipo_status: row.getCell(32).value || '',
                        num_employees_enum: parseInt(row.getCell(33).value) || 0,
                        locations: row.getCell(34).value || '',
                        growth_insight_description: row.getCell(35).value || '',
                        growth_insight_indicator: row.getCell(36).value || '',
                        growth_insight_direction: row.getCell(37).value || '',
                        growth_insight_confidence: parseFloat(row.getCell(38).value) || 0,
                        investor_insight_description: row.getCell(39).value || '',
                        permalink: row.getCell(40).hyperlink || row.getCell(40).value || '',
                        url: row.getCell(41).hyperlink || row.getCell(41).value || '',
                        created_by: userId,
                    });
                    existingUserIds.add(user_id);
                } else {
                    duplicateEntries.push(user_id);
                }
            }
        });

        console.log("Final Data to be Inserted:", JSON.stringify(samples, null, 2));

        // Insert only the unique records into the database
        if (samples.length > 0) {
            await Sample.bulkCreate(samples);
        }

        if (samples.length > 0 && duplicateEntries.length > 0) {
            return res.status(200).json({
                message: `${samples.length} records inserted successfully. ${duplicateEntries.length} duplicates were found.`,
                inserted: samples.length,
                duplicates: duplicateEntries
            });
        } else if (samples.length > 0) {
            return res.status(201).json({
                message: "File Uploaded Successfully!",
                inserted: samples.length
            });
        } else {
            return res.status(400).json({
                message: "Duplicate user_id found. No new data inserted.",
                duplicates: duplicateEntries
            });
        }
    } catch (error) {
        console.error("File upload error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


//logout using session.
exports.getLogout = async (req, res) => {
   try {
    req.session.destroy();
    return res.status(201).json({ message: "You Logged Out Successfully!" });
    // res.redirect("/login")
   } 
   catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: "Internal server error" });
    
   }
};
exports.getSearchByName = async (req, res) => {
    try {
    
    var search=req.body.search;
    var nameData =  await Sample.find({"name":{$regex:".*"+search+".*",$options: "i"}});
    if(nameData.length>0){
        res.status(200).send({success:true,msg:"Data details",data:nameData});
    }
    else{
        res.status(200).send({success:true,msg:"Data not found"});
    }

    } 
    catch (error) {
    res.status(400).send({success:false,msg:error.message})
     
    }
 };
 

 exports.deleteData = async (req, res) => {
    try {
        const id = req.params.id; // Extract the ID from the URL parameter
        console.log("id-----", id);

        // Validate ID (Ensure it's a valid number)
        if (isNaN(id)) {
            return res.status(400).json({ status: "error", message: "Invalid ID format" });
        }

        // Delete the item from the database
        const deletedRowCount = await Sample.destroy({ where: { id: id } });

        if (deletedRowCount === 0) {
            // If no data is found with the given ID, return a 404 error
            return res.status(404).json({ status: "error", message: "Data Not Found" });
        }

        console.log("Data deleted successfully");

        // Send a success response
        return res.status(200).json({ status: "success", message: "Data deleted successfully" });
    } catch (error) {
        console.log("error-------", error);
        console.error("Error deleting item:", error);

        // Send an error response in case of an exception
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
exports.deleteUser = async (req, res) => {
    try {
        const id = req.params.id; // Extract the ID from the URL parameter
        console.log("id-----", id);

        // Ensure ID is a valid number (Sequelize uses numeric IDs)
        if (isNaN(id)) {
            return res.status(400).json({ status: "error", message: "Invalid ID format" });
        }

        // Delete the user from the database
        const deletedRows = await User.destroy({ where: { id: id } });

        if (deletedRows === 0) {
            // If no data is found with the given ID, return a 404 error
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        console.log("User deleted successfully");

        // Send a success response
        return res.status(200).json({ status: "success", message: "User deleted successfully" });

    } catch (error) {
        console.error("Error deleting user:", error);
        
        // Send an error response in case of an exception
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

 

exports.updateData = async (req, res) => {
    try {
        const id = req.params.id; // Extract the ID from URL parameter

        // Validate ID (Ensure it's a valid number)
        if (isNaN(id)) {
            return res.status(400).json({ status: "error", message: "Invalid ID format" });
        }

        // Extract data from request body
        const updateFields = {
            created_at: req.body.fcreated_at,
            name: req.body.fname,
            short_description: req.body.fshort_description,
            semrush_global_rank: req.body.fsemrush_global_rank,
            semrush_visits_latest_month: req.body.fsemrush_visits_latest_month,
            num_investors: req.body.fnum_investors,
            funding_total: req.body.ffunding_total,
            num_exits: req.body.fnum_exits,
            num_funding_rounds: req.body.fnum_funding_rounds,
            last_funding_type: req.body.flast_funding_type,
            last_funding_at: req.body.flast_funding_at,
            num_acquisitions: req.body.fnum_acquisitions,
            apptopia_total_apps: req.body.fapptopia_total_apps,
            apptopia_total_downloads: req.body.fapptopia_total_downloads,
            contact_email: req.body.fcontact_email,
            phone_number: req.body.fphone_number,
            facebook: req.body.ffacebook,
            linkedin: req.body.flinkedin,
            twitter: req.body.ftwitter,
            num_investments: req.body.fnum_investments,
            num_lead_investments: req.body.fnum_lead_investments,
            num_lead_investors: req.body.fnum_lead_investors,
            listed_stock_symbol: req.body.flisted_stock_symbol,
            company_type: req.body.fcompany_type,
            hub_tags: req.body.fhub_tags,
            operating_status: req.body.foperating_status,
            founded_on: req.body.ffounded_on,
            categories: req.body.fcategories,
            founders: req.body.ffounders,
            website: req.body.fwebsite,
            ipo_status: req.body.fipo_status,
            num_employees_enum: req.body.fnum_employees_enum,
            locations: req.body.flocations,
            growth_insight_description: req.body.fgrowth_insight_description,
            growth_insight_indicator: req.body.fgrowth_insight_indicator,
            growth_insight_direction: req.body.fgrowth_insight_direction,
            growth_insight_confidence: req.body.fgrowth_insight_confidence,
            investor_insight_description: req.body.finvestor_insight_description,
            permalink: req.body.fpermalink,
            url: req.body.furl
        };

        // Remove undefined fields
        Object.keys(updateFields).forEach(key => {
            if (updateFields[key] === undefined) {
                delete updateFields[key];
            }
        });

        // Update the database using Sequelize
        const [updatedRowsCount] = await Sample.update(updateFields, { 
            where: { id: id } 
        });

        if (updatedRowsCount === 0) {
            return res.status(404).json({ status: "error", message: "Item not found" });
        }

        // Fetch updated data
        const updatedItem = await Sample.findByPk(id);

        console.log("Item updated successfully:", updatedItem);
        return res.status(200).json({ status: "success", message: "Item updated successfully", data: updatedItem });

    } catch (error) {
        console.error("Error updating item:", error.message);
        res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
};

   //Route to Show Element.
   exports.displayData=async(req,res)=>{
    try{
      console.log('Params:', req.params);
      //const id=req.params.id;//extract the id from url parameter.
      const updatedData = req.body
      //update data to database.
      const response= await Sample.findOneAndUpdate({ _id: req.params.id},updatedData,{
          new:true,
          runValidators:true
         
      })
      console.log(response);
      
      if(!response){
          res.status(400).json({error:"Can't retrive data and edit because of databse problem"})
        }
  
    res.render('dataViews',{response:response})
      //res.status(200).json(response)
        
      
      }
      catch(error){
       console.log(error);
       res.status(500).json(Error,"Internal server error")
       
      }
  };

  
exports.getUserPagination = async (req, res) => { 
        try {
            console.log("Request query received:", req.query); 
            let page = parseInt(req.body.page) || 1;
            let limit = parseInt(req.body.limit) || 10;
            if (limit === -1) limit = null; // Set to `null` for no limit
            let offset = (page - 1) * (limit || 1);
            let draw = parseInt(req.body.draw) || 1;
            let search = req.body.search || '';
            let categories = req.body.category || [];
            let start_date = req.body.start_date;
            let end_date = req.body.end_date;
    
            console.log("Testing body request =>", JSON.stringify(req.body));
    
            
            // let whereCondition = {};
            const whereCondition = {
                role: { [Op.ne]: "admin" } //  Exclude "admin" users
            };
    
            
    
            console.log("Final Query:", JSON.stringify(whereCondition, null, 2));
    
            // Fetch paginated data
            let { rows: data, count: totalDocuments } = await User.findAndCountAll({
                where: whereCondition,
                limit,
                offset
            });
    
            // Send response
            res.json({
                draw: draw,  
                recordsTotal: totalDocuments, 
                recordsFiltered: totalDocuments, 
                data: data
            });
    
        } catch (error) {
            console.error("Error fetching paginated data:", error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    };
    


  
  
        



const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
/* const upload = require('./config/cloudinary.config'); */
const {cloudinary} = require("./config/cloudinary.config");

const User = require("./models/User.model.js");
const Event = require("./models/Event.model.js");
const Images = require('./models/Images.model.js');

require("dotenv").config();
app.use(cookieParser());


const bcryptSalt = bcrypt.genSaltSync(10);

// app.use(express.json());
app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({limit: "50mb", extended: true}));

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

// ! console.log(process.env.MONGO_URL) si funciona dotenv
// mongoose.connect(process.env.MONGO_URL);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });





app.get("/test", (req, res, next) => {
  res.json("HOLA");
});


//TODO REGISTER

app.post("/register", async (req, res, next) => {
  const { username, email, password, code } = req.body;

  try {
    const userDoc = await User.create({
      username,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
      code,
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }
});


//TODO LOGIN

app.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const userDoc = await User.findOne({ email });

    if (!userDoc) {
      return res.status(401).json("Invalid credentials or user not found");
    }
    if (userDoc) {
      const passOk = bcrypt.compareSync(password, userDoc.password);
      if (passOk) {
        jwt.sign(
          { email: userDoc.email, id: userDoc._id},
          process.env.TOKEN_SECRET,
          { algorithm: "HS256", expiresIn: "24h" },
          (error, token) => {
            if (error) {
              throw error;
            }
            res.json({token, user: userDoc}); //petar userDoc
            /* res.json({token}); */
          }
        );
      } else {
        res.status(401).json("Invalid credentials");
      }
    }
  } catch (error) {
    res.status(422).json(error);
  }
});


//TODO PROFILE

app.get("/profile", (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(
      token.replace("Bearer ", ""),
      process.env.TOKEN_SECRET,
      { algorithm: "HS256", expiresIn: "24h" },
      async (error, userData) => {
        if (error) throw error;
      const {username, email, _id} =  await User.findById(userData.id)
        res.json({username, email, _id});
      }
    );
  } else {
    res.json(null);
  }
});


//TODO LOGOUT

app.post("/logout", (req, res, next) => { 
  res.json(true); //! si surts, no pots fer /account, has de tornar a logejar-te // en el NETWORK ha de surtir Preview TRUE si funciona
})


//TODO CLOUDINARY


app.post('/api/upload', async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authorizationHeader.replace("Bearer ", "");
  const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
  const userId = decodedToken.id; 
  try {
    const imageArray = req.body.data;
    const title = req.body.title
    //console.log("ARRAY",imageArray.length)
    const uploadResults = [];
    //console.log("IIMAGENES", imageArray)

    for (let i = 0; i < imageArray.length; i++) {
      const imageData = imageArray[i];
      //console.log("IMAGENDATA",imageData)
      const uploadedResponse = await cloudinary.uploader.upload(imageData, {
        upload_preset: "ml_default"
      });
      uploadResults.push(uploadedResponse.url);
    }
    console.log("RESULTADOS",uploadResults)
 
    const images = new Images({
      user: userId,
      imageUrls: uploadResults,
      title: title
    });
    await images.save();

    //console.log(uploadResults);
    res.json(title);
  } catch (error) {
    console.error(error);
    res.status(500).json({ err: "WRONG" });
  }
});



//TODO PILLAR DATA DEL CREATE EVENT




app.post("/events", async (req, res, next) => {
  const { title, date, hour, address, description, maxCapacity } = req.body;
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {

    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authorizationHeader.replace("Bearer ", "");
  const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
  const userId = decodedToken.id;
  console.log("TITULO",title);
  console.log("USERID",userId)
  try {
    // Fetch the images associated with the user from the Images model
    const images = await Images.findOne({ $and: [{ user: userId }, { title: title }] }).lean().exec();
    //const images = await Images.find({ user: userId });
   console.log("ARRAY BD",images.imageUrls)
      // Extract the image URLs from the fetched images
      const photoUrls = images.imageUrls.map((image) => image);
    console.log("YYYYYYYYYYYY",photoUrls[0])
    const eventDoc = await Event.create({
      owner: userId,
      title,
      date,
      hour,
      address,
      description,
      maxCapacity,
      photos: photoUrls,
    });
    res.json(eventDoc);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});





//TODO DISPLAY ADMIN EVENTS


app.delete("/events/:id/images", async (req, res) => {
  const { id } = req.params;
  const { imageIndexes } = req.body;

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Remove the selected images from the event's photos array
    imageIndexes.forEach((index) => {
      event.photos.splice(index, 1);
    });

    // Save the updated event
    await event.save();

    res.json({ message: "Event images deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});




//TODO llista per public_id que estan dintre de la carpeta

app.get("/api/images", async (req, res, next) => {
  const {resources} = await cloudinary.search.expression("folder:event.io").sort_by("public_id", "desc").max_results(30).execute();
  //*console.log(resources); 
  const publicIds = resources.map(file => file.public_id);
  res.send(publicIds); 
  
})


/* 
// POST "/api/upload" => Route that receives the image, sends it to Cloudinary via the fileUploader and returns the image URL
router.post("/upload", fileUploader.single("imageUrl"), (req, res, next) => {
  // console.log("file is: ", req.file)
 
  if (!req.file) {
    next(new Error("No file uploaded!"));
    return;
  }


    // Get the URL of the uploaded file and send it as a response.
  // 'fileUrl' can be any name, just make sure you remember to use the same when accessing it on the frontend

  res.json({ fileUrl: req.file.path });
});

const fileUploader = require("../config/cloudinary.config");

*/





const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`)
});

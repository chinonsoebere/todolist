const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");
let requestedList = '';
let requestedListRaw = '';
const fxns = require(__dirname + "/fxns.js")


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


//connect to mongo DB Database/Create a New DataBase
mongoose.connect('mongodb+srv://chinonsoebere:pa$$word123@cluster0.sn7un.mongodb.net/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//Create Items Schema
const Itemschema = {
  name: {
    type: String,
    required: [true, "Item cannot be empty"]
  }
}

//Create Items Model
const Item = mongoose.model('Item', Itemschema);

const item1 = new Item({
  name: "Welcome To Your To Do List."
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this button to delete an item."
});

const defaultItems = [item1, item2, item3];

//customList Schema
const listSchema = {
  name: String,
  items: [Itemschema]
}

const OtherItem = mongoose.model("OtherItem", listSchema);

app.get("/", function(req, res) {

  //find() retruns an array
  Item.find({}, function(error, foundItems) {

    if (foundItems.length === 0) {
      //  insert Many - Create
      Item.insertMany(defaultItems, function(error) {

        if (error) {
          console.log(error);
        } else {
          console.log("Default Items saved to DB");
        }
        //we use this so that home route would not remain empty.
        res.redirect("/");
       });
    } else {
      res.render("list", {
        title: "To Do List",
        listTitle: "Today",
        newListItems: foundItems
      });
    }

  })

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listTitle = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listTitle === "Today") {
    item.save(); //just insert one item into the collection
    res.redirect("/");
  } else {
    OtherItem.findOne({
      name: listTitle
    }, (err, foundList) => {
      console.log(foundList.name);
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listTitle)
    })
  }

});

app.get('/:customListName', function(req, res) {

  requestedList = _.lowerCase(req.params.customListName);
  requestedListRaw = req.params.customListName;

  OtherItem.findOne({
    name: requestedList
  }, function(err, foundList) {

    if (!err) {
      if (!foundList) {
        //console.log("Does not Exist")
        const otherItem = new OtherItem({
          name: requestedList,
          items: defaultItems
        })
        otherItem.save();
        res.redirect("/" + req.params.customListName);
      } else {
        //console.log("Exists")
        res.render("list", {
          title: fxns.capitalize(foundList.name),
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }

    }
  })

});



app.post("/delete", function(req, res) {

  const checkedItem = req.body.checkedItem;
  const listTitle = req.body.listName;

  if (listTitle === "Today") {
    Item.deleteOne({
      _id: checkedItem
    }, function(error) {
      if (error) {
        console.log(error);
      } else {
        console.log(checkedItem + " has been removed");
        res.redirect("/");
      }
    });
  } else {

    OtherItem.findOneAndUpdate({
      name: listTitle
    }, {
      $pull: {
        items: {
          _id: checkedItem
        }
      }
    }, (error, foundlist) => {
      if (!error) {
        console.log(checkedItem + " has been removed");
        res.redirect("/" + listTitle);
      } else {
        console.log(error);
      }
    });

  }

});

// let port = process.env.PORT;
// if (port == null || port == "") {
//   port = 3000;
// }

app.listen(process.env.PORT || 3000, function() {
    console.log("Server has started successfully");
});

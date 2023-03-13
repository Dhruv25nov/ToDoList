const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const date = require(__dirname + "/date.js")
const mongoose = require("mongoose");
const _ = require("lodash");




const url = "mongodb+srv://dhruv25nov:Dhruv25nov@cluster0.2kgw67n.mongodb.net/ToDoList?retryWrites=true&w=majority";

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

// mongoose.connect("mongodb://127.0.0.1/todolistDB");


const itemsSchema = new mongoose.Schema({
    name: String
});

// Creating model
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Create new list using parameter"
});

const item2 = new Item({
    name: "Press + to add new items"
});

const item3 = new Item({
    name: "Select checkbox to delete item"
});

const defaultItems = [item1, item2, item3];





app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.set("view engine", "ejs")



app.get("/", function (req, res) {


    Item.find()
        .then(items => {

            if (items.length === 0) {
                Item.insertMany(defaultItems)
                    .then(() => {
                        console.log("Default items inserted");
                    })
                    .catch((err) => {
                        console.log(err);
                    })
                res.redirect("/")

            }
            else {

                res.render("list", { listName: "Today", listItems: items });
            }

        })
        .catch(err => {
            console.log(err);
        })




});

const listsSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]

});

const List = mongoose.model("List", listsSchema)


app.get('/:listName', (req, res) => {
    const listName = _.capitalize(req.params.listName);

    List.findOne({ name: listName })
        .then((foundList) => {

            if (!foundList) {


                const newList = new List({
                    name: listName,
                    items: defaultItems
                });

                newList.save();
                res.redirect("/" + listName);

            }
            else {

                res.render("list", { listName: foundList.name, listItems: foundList.items })
            }



        })
        .catch((err) => {
            console.log(err);
        })




});

app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const newItem = new Item({
        name: itemName
    });

    if (listName === "Today") {
        newItem.save();
        res.redirect("/")

    }
    else {
        List.findOne({ name: listName })
            .then((foundList) => {
                foundList.items.push(newItem);
                foundList.save();
                res.redirect("/" + listName);
            })
    }






});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName

    // Delete a document by ID
    if (listName === "Today") {
        Item.findByIdAndDelete(checkedItemId)
            .then((doc) => {
                res.redirect("/");

            })
            .catch((err) => {
                console.log(err);
            });




    }
    else {
        List.findOneAndUpdate(
            { name: listName },
            { $pull: { items: { _id: checkedItemId } } }
        )
            .then(function (foundList) {
                res.redirect("/" + listName);
            })
            .catch(function (err) {
                console.log("err in delete item from custom list");
            });

    }



})



app.listen(process.env.PORT || 3000, function () {
    console.log("The server is running on port 3000");
});


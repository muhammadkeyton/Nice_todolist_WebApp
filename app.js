const express = require("express");
const _ = require("lodash");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js");
const app=express();

app.use(express.static(__dirname+"/public"));

// using ejs
app.set('view engine', 'ejs');

//using body-parser
app.use(bodyParser.urlencoded({ extended: true }))

//connecting to mongodb database
mongoose.connect(process.env.database, { useNewUrlParser: true });

//creating the schema for the items and lists collections in todolist database
const itemsSchema = mongoose.Schema({
  name:{
    type:String,
    required: [true, 'you need to provide the data for this item']
  }
});

const listSchema = mongoose.Schema({
  name:{
    type:String,
    required: [true, 'you need to provide the data for this item']
  },
  items:[itemsSchema]
});

//creating the model for the items and lists collection
const Item = mongoose.model("Item",itemsSchema);
const List = mongoose.model("list",listSchema);
//sample data documents to populate in empty items collection in database

const item1 = new Item({
  name:"Welcome to your todolist webapp."
});

const item2 = new Item({
  name:"to add new items tap the '+'button."
});

const item3 = new Item({
  name:"<-- check this to delete completed tasks."
});

const sampleData = [item1,item2,item3];


app.get("/",(req,res)=>{
  //inserting sampledata when items collection is empty
  Item.find({},(err,founditems)=>{
    if(!err){
      if(founditems.length === 0){
        Item.insertMany(sampleData,(err,docs)=>{
          if(err){
            console.log(err);
          }else{
            console.log("successfully loaded sample data in items collection in database.");
            res.redirect("/");
          }
        });

      }else{
        res.render("index",{data:founditems,listType:'Today',date:date.getDate(),year:date.getYear()});
      }

    }

  });

});

app.get("/:newlist",(req,res)=>{
  const list = _.capitalize(req.params.newlist);

//checking if the specified route is in database and creating it if not found and rendering it found.
  List.findOne({name:list},(err,foundlist)=>{
    if(err){
      console.log(err);
    }else{
      if(!foundlist){
        const newList = new List({
          name:list,
          items:sampleData
        });
        newList.save();
        res.redirect("/"+list);
      }else{
        res.render("index",{listType:list,data:foundlist.items,date:date.getDate(),year:date.getYear()})
      }

    }

  });

});

//adding new items to the database
app.post("/",(req,res)=>{
  const newItem = req.body.newItem;
  const listType = req.body.listType;
  // console.log(req.body);
  const item = new Item({
    name:newItem
  })
  if(listType === "Today"){
    if(newItem.length > 0){
      item.save();
      setTimeout(()=>{
        res.redirect("/");
      },300);

    }else{
      res.redirect("/");
    }
  }else{
    List.findOne({name:listType},(err,foundlist)=>{
      if(err){
        console.log(err);
      }else{
        if(newItem.length > 0){
          foundlist.items.push(item);
          foundlist.save()
          setTimeout(()=>{
            res.redirect("/"+listType);
          },300);

        }else{
          res.redirect("/"+listType);
        }

      }
    });

  }

});


//deleting items from database
app.post("/delete",(req,res)=>{
  const itemId = req.body.itemId;
  const listType = req.body.listType;
  if(listType === "Today"){
    Item.findByIdAndRemove(itemId,(err)=>{
      if(err){
        console.log(err);
      }else{
        console.log("successfully deleted document in items collection from database.");
        res.redirect("/");
      }
    });

  }else{
    List.findOneAndUpdate({name:listType},{ $pull: {items:{_id:itemId} } },(err,docs)=>{
      if(err){
        console.log(err);
      }else{
        console.log("successfully deleted document in lists collection from database.");
        res.redirect("/"+listType);
      }
    });


  }

});

let port = process.env.PORT;
if (port == null || port == "") {
  port =3000;
}


app.listen(port,(req,res)=>{
  console.log(`server successfully started on port ${port}`);
});

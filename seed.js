var mongoose=require("mongoose");
var Product=require("./models/product")

var data=[
      
      {
          title:"CASIO",
          imagepath:"watch1.jpeg",
          description:"Note that the changes to the grid breakpoints in v4 means that you’ll need to go one breakpoint larger to achieve the same results. The new responsive utility classes don’t attempt to accommodate less common cases where an element’s visibility.",
          Price: 2
      },
      {
          title:"RADO",
          imagepath:"watch2.jpg",
          description:"Note that the changes to the grid breakpoints in v4 means that you’ll need to go one breakpoint larger to achieve the same results. The new responsive utility classes don’t attempt to accommodate less common cases where an element’s visibility.",
          Price: 4
      },
      {
          title:"ROLEX",
          imagepath:"watch3.jpg",
          description:"Note that the changes to the grid breakpoints in v4 means that you’ll need to go one breakpoint larger to achieve the same results. The new responsive utility classes don’t attempt to accommodate less common cases where an element’s visibility.",
          Price: 6
      },
      {
          title:"G-Shock",
          imagepath:"watch1.jpeg",
          description:"Note that the changes to the grid breakpoints in v4 means that you’ll need to go one breakpoint larger to achieve the same results. The new responsive utility classes don’t attempt to accommodate less common cases where an element’s visibility.",
          Price: 8
      },
      {
          title:"APPLE",
          imagepath:"watch2.jpg",
          description:"Note that the changes to the grid breakpoints in v4 means that you’ll need to go one breakpoint larger to achieve the same results. The new responsive utility classes don’t attempt to accommodate less common cases where an element’s visibility.",
          Price: 10
      },
      {
          title:"ROSSALA",
          imagepath:"watch3.jpg",
          description:"Note that the changes to the grid breakpoints in v4 means that you’ll need to go one breakpoint larger to achieve the same results. The new responsive utility classes don’t attempt to accommodate less common cases where an element’s visibility.",
          Price: 12
      }
    
    ];


function seedDB(){
    //Remove all campgrounds
    Product.remove({},function(err){
    if(err)
    {
        console.log(err);
    }
    console.log("Removed the data");
     //Add few campgrounds
       data.forEach(function(seed){
       Product.create(seed,function(err,product){
           if(err)
           {
               console.log(err);
           }
           else
           {
           	   product.save();
               console.log("Added a Product");
           }
       });
   });
})};

module.exports=seedDB;
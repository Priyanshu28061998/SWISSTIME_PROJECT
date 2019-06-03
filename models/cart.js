module.exports=function Cart(oldCart){
	this.items=oldCart.items;
	this.totalQty=oldCart.totalQty;
	this.totalPrice=oldCart.totalPrice;

	this.add=function(item,id){
		var storedItem=this.items[id];
		if(!storedItem){
			storedItem=this.items[id]={item: item,qty: 0,price: 0};
		}
		storedItem.qty++;
		storedItem.price=storedItem.item.Price*storedItem.qty;
		this.totalQty++;
		this.totalPrice+=storedItem.item.Price;
	}
    
    this.remove=function(item,id){
		var storedItem=this.items[id];
		if(storedItem){
			storedItem.qty--;
		    storedItem.price=storedItem.item.Price*storedItem.qty;
		    this.totalQty--;
		    this.totalPrice=this.totalPrice-storedItem.item.Price;
		}
	}
	;

	

	this.generateArray=function(){
		var arr=[];
		for(var id in this.items){
			arr.push(this.items[id]);
		}
		return arr;
	};
}
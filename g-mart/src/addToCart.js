export default async function addToCart(product){

    const userdata = localStorage.getItem('token')
    console.log("user token : ",userdata);
    if (!userdata){
      const exists = JSON.parse(localStorage.getItem('cart') || '[]');
      const updateCart = [...exists, product];
      localStorage.setItem('cart', JSON.stringify(updateCart));
      console.log("Cart updated for guest user.");
      console.log("Cart Token Set !..");
    }
      const username = userdata;
      console.log('User Token derrived data is : ',username);
      const response = await fetch('http://localhost:5000/api/addcart',{
        method:'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization : `Bearer  ${localStorage.getItem('token')}`,
        },
        body:JSON.stringify({
          pid:product._id,
          usertoken:userdata,
          name:product.name,
          price:product.price,
          description:product.description,
          url:product.url,
          stars:0
        })
      });

      if (response.ok){
        const data = await response.json();
        alert(data.message);
      }

      else{
        alert('Error:While trying to connect to Server')
      }
}
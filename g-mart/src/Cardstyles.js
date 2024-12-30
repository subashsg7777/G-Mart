// Card.js
import React from 'react';
import {useNavigate} from 'react-router-dom';

const Cardstyles = ({ image, text }) => {

    const navigate = useNavigate();
    // function to forward to cat.js
    const handlePassing = (cat)=>{
        navigate(`/catagory/${cat}`);
    };
    return (
        <div style={styles.cardContainer}>
            <img src={image} alt={text} style={styles.imageStyle} onClick={(e)=> {e.preventDefault();handlePassing(text)}}/>
            <p style={styles.textStyle}>{text}</p>
        </div>
    );
};

const styles = {
    cardContainer: {
        width: '120px',
        margin: '10px',
        textAlign: 'center',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        borderRadius: '10px',
        padding: '10px',
    },
    imageStyle: {
        width: '100px',
        height: '100px',
        objectFit: 'cover',
        borderRadius: '10px',
    },
    textStyle: {
        marginTop: '8px',
        fontSize: '14px',
        color: '#333',
    },
};

export default Cardstyles;

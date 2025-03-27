import recipePic from './assets/recipe.jpg'

function Card() {
    return(
        <div className="card">
            <img src={recipePic} alt="Recipe" />
            <h2>Recipes</h2>
            <p>Get access to recipes</p>
        </div>
    );
}

export default Card
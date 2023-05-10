const PAGE_SIZE = 10
const pgBtnNum = 5;
let currentPage = 1;
let pokemons = [];

// Function to display pagination 
const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty()

  if (currentPage > 1) {
    $("#pagination").append(
      `<button class ="btn btn-primary numberedButtons ml-1" id="firstPage" value="1">First</button>
      <button class ="btn btn-primary numberedButtons ml-1" id="previousPage" value="${currentPage - 1}">Previous</button>`
    )
  }

  //Displays two page buttons before and after current page
  const startPage = Math.max(1, currentPage - Math.floor(pgBtnNum / 2));
  const endPage = Math.min(numPages, currentPage + Math.floor(pgBtnNum / 2));

  for (let i = startPage; i <= endPage; i++) {
    //Adds active class to page button on current page
    (i == currentPage) ? active = "active" : active = "";

    $('#pagination').append(`
    <button class="btn btn-primary page ml-1 numberedButtons ${active}" value="${i}">${i}</button>
    `)
  }
  //Adds nextPage and lastPage buttons if currentPage is less than numPages(81)
  if (currentPage < numPages) {
    $("#pagination").append(
      `<button class ="btn btn-primary numberedButtons ml-1" id="nextPage" value="${currentPage + 1}">Next</button>
      <button class ="btn btn-primary numberedButtons ml-1" id="lastPage" value="${numPages}">Last</button>`
    )
  }
}

//Function to display up to 10 pokemon based on currentPage
const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  console.log("Number of selected pokemon: " + selected_pokemons.length)
  $('#pokeCards').empty()
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `)
  })

  //Header to display number of pokemon currently being displayed
  $("#numPokemonDisplayed").html(
    `<h3> Showing ${selected_pokemons.length} of ${pokemons.length} Pokemon</h3>`
   );
}

const setup = async () => {

  // Create filter buttons
  $("#pokeTypesFilter").empty();
  let typesResponse = await axios.get("https://pokeapi.co/api/v2/type");
  let pokemonTypes = typesResponse.data.results;
  const filterTypes = pokemonTypes.map((pokemonType) => pokemonType.name);
  filterTypes.forEach((type) => {
    $("#pokeTypesFilter").append(
      `<input
      id="${type}"
      class="typeFilter"
      type="checkbox"
      name="type"
      value="${type}"
    />  
    <label htmlfor="${type}" for="${type}"> ${type} </label>  `);
  });

 $("#numPokemonDisplayed").empty();
 

 

  $('#pokeCards').empty()

  //Retrieves 810 pokemon objects from the api and stores them in the pokemons array
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;


  paginate(currentPage, PAGE_SIZE, pokemons);
  var numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)

  //Function to retrieve pokemon types
  const getPokemonTypes = async (pokemonName) => {
    const res = await axios.get(`
      https://pokeapi.co/api/v2/pokemon/${pokemonName}`
    );
    return res.data.types.map((type) => type.type.name);
  };

  //On cnange function to filter out the types of pokemon to be retrieved
  $('body').on('change', '.typeFilter', async function (e) {
    const selectedTypes = $("input[name='type']:checked")
      .map(function () {
        console.log(this.value);
        return this.value;
      }).get();

    // If any types are selected, then filter the pokemon to be retrieved
    if (selectedTypes.length > 0) {
      let filteredTypes = await Promise.all(
        /*iterates through each pokemon inside the pokemons array
        and fetches each of their types*/
        pokemons.map(async (pokemon) => {
          const pokemonTypes = await getPokemonTypes(pokemon.name);

          // Checks if every selected type is included in the pokemonTypes array
          // If it is included, pokemon with that type are returned, otherwise null is returned
          return selectedTypes.every((type) => 
            pokemonTypes.includes(type))
            ? pokemon : null;
        })
      );
      //All null values inside the filteredTypes array are removed
      pokemons = filteredTypes.filter((p) => p !== null);
    } else {
      pokemons = response.data.results;
    }
      console.log(pokemons.length);
      paginate(currentPage, PAGE_SIZE, pokemons);
      const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
      console.log(numPages);
      updatePaginationDiv(currentPage, numPages);

  });

  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  // add event listener to pagination buttons
  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value)
    paginate(currentPage, PAGE_SIZE, pokemons)
    console.log(pokemons.length);

    numPages = Math.floor(pokemons.length / PAGE_SIZE);
    updatePaginationDiv(currentPage, numPages)
  })

  console.log("setup complete")

}


$(document).ready(setup)
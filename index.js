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
}

const setup = async () => {
  
  // test out poke api using axios here
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
  })


  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;


  paginate(currentPage, PAGE_SIZE, pokemons)
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)



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

    //update pagination buttons
    updatePaginationDiv(currentPage, numPages)
  })

}


$(document).ready(setup)
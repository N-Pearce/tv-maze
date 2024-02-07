"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");


/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
    const res = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`);
    let movieArr = [];
    for (let movie of res.data){
        let { id, name, summary } = movie.show;
        const movieObj = {
            id,
            name,
            summary,
            image: movie.show.image?.medium
        };
        movieArr.push(movieObj);
    }
    return movieArr;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image!=null ? show.image : 'https://tinyurl.com/tv-missing'}"
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) { 
    let episodesArr = [];
    const res = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
    for (let episode of res.data){
        const { id, name, season, number} = episode;
        const episodeObj = {
            id,
            name,
            season,
            number
        };
        episodesArr.push(episodeObj);
    }
    return episodesArr;
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) { 
    $episodesArea.empty();

    for (let episode of episodes) {
        const $episode = $(`
            <li>${episode.name} (season ${episode.season}, episode ${episode.number})</li>
        `);
  
      $episodesArea.append($episode);
    }
}

$showsList.on('click', '.Show-getEpisodes', async function(e){
    // recieves the outer-most div of the movie that contains the data-show-id in the class
    const selectedShow = e.target.parentElement.parentElement.parentElement;
    let showId = selectedShow.getAttribute('data-show-id');
    
    const episodes = await getEpisodesOfShow(showId);
    populateEpisodes(episodes);

    $episodesArea.show();
})
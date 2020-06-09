const leftMenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
const tvShowsList = document.querySelector('.tv-shows__list');
const modal = document.querySelector('.modal');
const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const API_KEY = 'cc79778b8ac5e06059d9d011a62c4735';
const API_URL = 'https://api.themoviedb.org/3/movie/550?api_key=cc79778b8ac5e06059d9d011a62c4735';
const SERVER = 'https://api.themoviedb.org/3';
const tvShows = document.querySelector('.tv-shows')
const tvCardImg = document.querySelector('.tv-card__img')
const modalTitle = document.querySelector('.modal__title')
const genresList = document.querySelector('.genres-list')
const rating = document.querySelector('.rating')
const description = document.querySelector('.description')
const modalLink = document.querySelector('.modal__link')
const searchForm = document.querySelector('.search__form')
const searchFormInput = document.querySelector('.search__form-input')
const preloader = document.querySelector('.preloader')
const dropdown = document.querySelectorAll('.dropdown')
const tvShowsHead = document.querySelector('.tv-shows__head')
const posterWrapper = document.querySelector('.poster__wrapper')
const modalContent = document.querySelector('.modal__content')




const loading = document.createElement('div')
loading.className = 'loading';

const dbService = class {
  getData = async (url) => {
    const res = await fetch(url);
    if (res.ok) {
      return res.json();
    } else {
      throw new Error(`не удалось получить данные по адресу ${url}`)
    }
  }
  getTestData = () => {
    
    return this.getData('test.json');
  }
  getTestCard = () => {
    return this.getData('card.json')
  }
  getSearchResult = query => {
    return this.getData(SERVER + '/search/tv?api_key=' + API_KEY + '&language=ru-RU&query=' + query);
  }
  getTvShow = id => {
    return this.getData(SERVER + '/tv/' + id + '?api_key=' + API_KEY + '&language=ru-RU')
  }
  getTopRated = () => this.getData(`${SERVER}/tv/top_rated?api_key=${API_KEY}&language=ru-RU `)

  getPopular = () => this.getData(`${SERVER}/tv/popular?api_key=${API_KEY}&language=ru-RU `)

  getToday = () => this.getData(`${SERVER}/tv/airing_today?api_key=${API_KEY}&language=ru-RU `)

  getWeek = () => this.getData(`${SERVER}/tv/on_the_air?api_key=${API_KEY}&language=ru-RU `)
}


const renderCard = response => {
  tvShowsList.textContent = '';
  if (!response.total_results){
    loading.remove();
    tvShowsHead.textContent = 'К сожалению по вашему запросу ничего не найдено...'
    tvShowsHead.style.cssText = 'color: red;'
    return;
  }
  tvShowsHead.textContent = 'Результат поиска'
  tvShowsHead.style.cssText = 'color: black;'
  response.results.forEach(item => {
    const { backdrop_path:backdrop,
        name:title,
        poster_path:poster,
        vote_average:vote,
        id
        } = item;
    const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
    const backdropIMG = backdrop ? IMG_URL + backdrop : '';
    const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';
    const card = document.createElement('li');
    card.idTV = id;
    card.classList.add('tv-shows__item');
    card.innerHTML= `
    <a href="#" id="${id}" class="tv-card">
        ${voteElem}
        <img class="tv-card__img"
            src="${posterIMG}"
            data-backdrop="${backdropIMG}" alt="${title}">
        <h4 class="tv-card__head">${title}</h4>
    </a>
    `;
    loading.remove();
    tvShowsList.prepend(card);
  })
}

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  const value = searchFormInput.value.trim();
  searchFormInput.value = '';
  tvShowsList.append(loading);
  new dbService().getSearchResult(value).then(renderCard);

// console.log(event);
});

const closeDropdown = () => {
  dropdown.forEach(item => {
    item.classList.remove('active');
  })
}

hamburger.addEventListener('click', () => {
  leftMenu.classList.toggle('openMenu')
  hamburger.classList.toggle('open')
  closeDropdown();
})

document.addEventListener('click', (event) => {
  if (!event.target.closest('.left-menu')) {
    leftMenu.classList.remove('openMenu')
    hamburger.classList.remove('open')
    closeDropdown();
  }
})

leftMenu.addEventListener('click', event => {
  const target = event.target;
  const dropdown = target.closest('.dropdown')
  if (dropdown) {
    dropdown.classList.toggle('active')
    leftMenu.classList.add('openMenu')
    hamburger.classList.add('open')
  }
  if (target.closest('#top-rated')) {
    new dbService().getTopRated().then(renderCard);
  }
  if (target.closest('#popular')) {
    new dbService().getPopular().then(renderCard);
  }
  if (target.closest('#week')) {
    new dbService().getWeek().then(renderCard);
  }
  if (target.closest('#today')) {
    new dbService().getToday().then(renderCard);
  }
})


tvShowsList.addEventListener('click', (event) => {
  event.preventDefault();
  const target = event.target;
  const card = target.closest('.tv-card')
  if (card) {
    // preloader.style.dispaly = 'block';
    // new dbService().getTestCard().then(data => {
    new dbService().getTvShow(card.id).then(data => {
      // console.log(tvCardImg);

      if (data.poster_path) {
        tvCardImg.src = IMG_URL + data.poster_path;
        tvCardImg.alt = data.name;
        posterWrapper.style.display = '';
      } else {
        posterWrapper.style.display = 'none';
        // modalContent.style.padding-left = '25px';
      }
      
      modalTitle.textContent = data.name;
      // genresList.innerHTML = data.genres.reduce((acc, item) => {
      //   return `${acc} <li>${item.name}</li>`
      // }, '')
      genresList.innerHTML = ``;
      for (const item of data.genres) {genresList.innerHTML = genresList.innerHTML + `<li>${item.name}</li>` };
      rating.textContent = data.vote_average;
      description.textContent = data.overview;
      modalLink.href = data.homepage;
      
    })


    document.body.style.overflow = 'hidden';
    modal.classList.remove('hide')
  }
})

modal.addEventListener('click', event => {
  // if (event.target.classList.contains('modal'))
  if (event.target.closest('.cross') || event.target.classList.contains('modal')) {
    document.body.style.overflow = '';
    modal.classList.add('hide');
  }
})

const changeImage = event => {
  const card = event.target.closest('.tv-shows__item');
  if (card) {
    const img = card.querySelector('.tv-card__img')
    // const changeImg = img.dataset.backdrop;
    if (img.dataset.backdrop) {
      [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src]
    // if (changeImg) {
      // img.dataset.backdrop = img.src;
      // img.src = changeImg;
    }
  }
}

tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage);





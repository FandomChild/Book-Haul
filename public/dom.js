// do dom content loaded so html page loads before these functions are processed
// use dom to get elements and set functions to handle the dropdown, getting info from library search api along with cover api then passing info

document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById('search');
    const dropdown = document.getElementById('dropdown');

    const debounce = (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func(...args);
            }, delay);
        };
    };

// create and pass in consts to fetch data function then update dropdown after the consts have values
    const handleDebounce = async function () {
        const searchTerm = input.value.trim();
        console.log(searchTerm);

        try {
            const { title, author, cover } = await fetchData(searchTerm);            
            
            console.log(`title: ${title}`);
            console.log(`author: ${author}`);
            console.log(`cover: ${cover}`);

            await updateDropdown(title, cover, author, dropdown);
        } catch (error) {
            console.error('Error updating dropdown:', error);
        }
    };
    
// the debounces will handle the wait time after something has been typed into the search bar
    input.addEventListener('input', debounce(handleDebounce, 300));

// dropdown is closed when clicked somewhere else. handles enter? no
    document.addEventListener('click', function (event) {
        if (!event.target.closest('.dropdown')) {
            dropdown.style.display = 'none';
        }
    });
});

// use library search api instructions to get information for anything typed into search bar, limit 10
// everything revceived from api will be in objects passed back, in json
async function fetchData(searchTerm) {
    try {
        const response = await fetch(`https://openlibrary.org/search.json?q=${searchTerm}&limit=10`);
        if (!response.ok) {
            throw new Error(`Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('this is data', data);
        const result = data.docs;
        console.log("this is result" + result);
        const title = result.map((book) => book.title);
        const author = result.map((book) => book.author_name ? book.author_name[0] : 'Unknown');
        const cover = result.map((book) => book.cover_i);        
        console.log(title);
        return { title, author, cover};
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
}

// handle the dropdown that occurs after search bar is used
async function updateDropdown(titles, coverIds, authorName, dropdown) {

    // this will make dropdown appear if one or more titles is received from api, if not used, dropdown will not work correctly
    if (titles.length > 0) {
        dropdown.style.display = 'block';
    } else {
        dropdown.style.display = 'none';
    }

    console.log('this is titles' + titles)
    
    // clear any existing content in the dropdown
    while (dropdown.firstChild) {
        dropdown.removeChild(dropdown.firstChild);
    }
    
    // create list titles based on the fetch results, add everything to a div
    // create the link, will have everything that needs to be passed into the review page through query
    // has to be for each item in the lists
    titles.forEach((item, index) => {
        const a = document.createElement('a');
        a.href = `/review?title=${item}&author=${authorName[index]}&coverId=${coverIds[index]? coverIds[index]: 0}`;
        console.log('this is title link ' + a.href);
        
        const li = document.createElement('li');
        li.className = 'listItem';
        
        const img = document.createElement('img');
        img.src = `https://covers.openlibrary.org/b/id/${coverIds[index]}-S.jpg?default=https://openlibrary.org/static/images/icons/avatar_book-sm.png`;
        img.width = 40;
        img.height = 60;
        img.alt = 'book picture';
        console.log('ths is img src ' + img.src)
        
        const div = document.createElement('div');
        
        const titleP = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = item;
        titleP.appendChild(strong);
        console.log('this is titleP ' + titleP.innerHTML);
        
        const authorP = document.createElement('p');
        authorP.textContent = `By ${authorName[index]}`;
        console.log('this is authorP ' + authorP.textContent);

        div.appendChild(titleP);
        div.appendChild(authorP);
        
        li.appendChild(img);
        li.appendChild(div);
        a.appendChild(li);
        
        dropdown.appendChild(a);
    });
};

// both of these functions can't be dom content loaded because they need to be loaded before/along with the page to display correct info
// both need to make sure the first p tag was actually there or the rest won't work/work properly

// take value from hidden p tag then get the element that matches that rating
// add the att checked so that the hearts will have the corrct previous rating
const rank = document.getElementById('rank');
if (rank) {
    var set = rank.innerHTML;
    const rating = document.getElementById(`rating-${set}`);
    rating.setAttribute("checked", '');
    console.log(rating.value);
    console.log(set);
}

// take value from hidden p tag then get that element and add the att selected so that the correct sorting order appears
const order = document.getElementById('sortOrder');
if (order) {
    console.log(order);
    var change = order.innerHTML;
    const sort = document.getElementById(`${change}s`);
    sort.setAttribute("selected", '');
    console.log(sort.value);
    console.log(change);
}
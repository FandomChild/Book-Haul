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
    
    input.addEventListener('input', debounce(handleDebounce, 300));

    document.addEventListener('click', function (event) {
        // Close dropdown when clicking outside the search container
        if (!event.target.closest('.dropdown')) {
            dropdown.style.display = 'none';
        }
    });
    
});

async function fetchData(searchTerm) {
    try {
        const response = await fetch(`https://openlibrary.org/search.json?q=${searchTerm}&limit=10`);
        if (!response.ok) {
            throw new Error(`Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('this is data', data);
        const result = data.docs;
        const title = result.map((book) => book.title);
        const author = result.map((book) => book.author_name ? book.author_name[0] : 'Unknown');
        const cover = result.map((book) => book.cover_i);        
        console.log(title)
        return { title, author, cover};
    } catch (error) {
        console.error("Error fetching data: ", error);
    }
}

async function updateDropdown(titles, coverIds, bookAuthors, dropdown) {
    // Clear any existing content in the dropdown
    if (titles.length > 0) {
        dropdown.style.display = 'block';
    } else {
        dropdown.style.display = 'none';
    }
    
    console.log('this is titles' + titles)
    while (dropdown.firstChild) {
        dropdown.removeChild(dropdown.firstChild);
    }
    
    // Create list titles based on the fetch results
    titles.forEach((item, index) => {
        const a = document.createElement('a');
        a.href = `/book?title=${item}&author=${bookAuthors[index]}&coverId=${coverIds[index]? coverIds[index]: 0}`;
        console.log('this is title ' + a.href)
        
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

        console.log('this is item name? ' + strong.textContent)
        titleP.appendChild(strong);
        console.log('this is titleP ' + titleP.strong)
        
        const authorP = document.createElement('p');
        authorP.textContent = `By ${bookAuthors[index]}`;
        console.log('this is authorP ' + authorP.textContent)

        div.appendChild(titleP);
        div.appendChild(authorP);
        
        li.appendChild(img);
        li.appendChild(div);
        a.appendChild(li);
        
        dropdown.appendChild(a);
    });
};
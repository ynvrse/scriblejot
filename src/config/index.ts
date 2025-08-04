const title = 'ScribleJot – Catatan, To-Do List, dan Shopping List Interaktif';

const version = '1.0.0';

const repoName = 'scriblejot';

const author = 'Dion Firmansyah';

const email = 'dioonfirmansyah@gmail.com';

const github = 'https://github.com/ynvrse/';

const repository = github + repoName;

const dateFormat = 'MMMM DD, YYYY';

const loader = {
    // no more blinking in your app
    delay: 300, // if your asynchronous process is finished during 300 milliseconds you will not see the loader at all
    minimumLoading: 700, // but if it appears, it will stay for at least 700 milliseconds
};

const defaultMetaTags = {
    image: '/cover.png',
    description: 'Starter kit for modern web applications',
};

export { author, dateFormat, defaultMetaTags, email, github, loader, repoName, repository, title, version };

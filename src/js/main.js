//стартовые конфигурации
let param = {
        count: 50,
        fields: 'about,bdate,career,city,contacts,country,interests,photo_100,activities,movies,music,nickname,quotes,site,status',
        search_global: 1,
        offset: 0
}
//словарь
const dictionary = {
        id: 'Идентификатор',
        first_name: 'Имя',
        last_name: 'Фамилия',
        bdate: 'Дата рождения',
        city: 'Город',
        country: 'Страна',
        mobile_phone: 'Мобильный телефон',
        home_phone: 'Домашний телефон',
        career: 'Карьера',
        interests: 'Интересы',
        about: 'О себе',
        activities: 'Деятельность',
        movies: 'Любимые фильмы',
        music: 'Любимая музыка',
        nickname: 'никнейм',
        quotes: 'любимые цитаты',
        site: 'адрес сайта',
        status: 'статус пользователя'
};

let [dataPeople, idCountry, CountLoadPeoples] = [[], {}, 0];

sendRequest('database.getCountries', {need_all: 1, count: 250}, (data) =>{
        let c = data.response.items;

        c.forEach((item) => {
              idCountry[item.title] = item.id;
        });
});
/*
---------------------------------------------------
                Получение данных
--------------------------------------------------
*/
function loadPeoples(){
        sendRequest('users.search', param, (data) => {
                if(CountLoadPeoples === 0 || data.response.count === 0 || CountLoadPeoples !== data.response.count){
                        dataPeople              = data.response.items;
                        CountLoadPeoples        = data.response.count;

                        let block = document.getElementById('data-peoples');
                        block.innerHTML = '';

                        GetListPeoples(data.response.items);
                }else{
                      loadPeoples();
                }
        })
}

const form      = document.querySelector('#js-get_data');
const form_butt = form.querySelector('#js-get_list');

form_butt.addEventListener("click", () => {
        document.getElementById('data-info').innerHTML = '';
        param.offset = 0;

        SetData();                               //получаем все данные
        loadPeoples();                           //делаем запрос
});

function SetData(){
        let par = form.querySelectorAll('.js-list__item');
        let p = {};

        for (let param of par){
                let data = param.querySelectorAll('.js-data');

                for(let info of data)
                    p[$.trim(info.dataset.name)] = $.trim(info.value);
        }

        comleteData(p);
}

function comleteData(par){
        let keys = Object.keys(par);

        getCountry(par);
        GetIdCity(par);
        getData(par, keys);
        GetName(par, keys)
}

function getData(par, keys){
        keys.forEach((item) => {
                (item != 'country' && item != 'city' && item.indexOf('name') == -1) ? (par[item] ? param[item] = par[item] : delete param[item]) : '';
        });
}

function getCountry(par){
        (par['country'] && idCountry[par['country']]) ? param['country'] = idCountry[par['country']] : delete param['country'];
}

function GetName(par, keys){
        let s ='';
        keys.forEach((item) => {
                (item.indexOf('name') !== -1 && par[item]) ? (s == '' ? s+= par[item] : s+= ' ' + par[item]) : '';
        });

        (s != '') ? param['q'] = s : delete param['q'];
}
/*
---------------------------------------------------------------
                        получение списка людей
---------------------------------------------------------------
*/
function GetListPeoples(data){
        let block = document.getElementById('data-peoples');
        let html = '';

        if(data && data.length !== 0){
            for(let i = 0; i < data.length; i++){
                        html += `<div class="list-people__item ${i % 2 == 0 ? 'list-people__item_left' : 'list-people__item_right'} js-list-people__item" id="people_${+i + param.offset}">
                                        <a class="list-people__item_img" href="https://vk.com/id${data[i].id}" target="_blank">
                                                <img src="${data[i].photo_100}" class="list-people__item_img-i">
                                        </a>
                                        <div class="list-people__item_info">
                                             <p class="list-people__item_name">${data[i].last_name} ${data[i].first_name}</p>
                                        </div>
                                        <button class="btn btn-primary btn-sm list-people__item_bth js-add-info" onclick="GetMaxInfo(id);" id="${+i + param.offset}">Показать больше</button>
                                </div>`;
            }
            block.innerHTML += html;

            let fin = document.querySelectorAll('.js-add-info');
            let id = fin[fin.length - 1].getAttribute('id');

            let but;
            if(but = document.getElementById('AddPeoples'))
                    but.parentNode.removeChild(but);

            if(CountLoadPeoples > (+id + 1)){
                    html = `<div class="get-peoples" id="AddPeoples">
                                    <button class="btn btn-success btn-block" onclick="GetNewPeoples();">Добавить</button>
                            </div>`;

                    block.innerHTML += html;
            }
        }else{
            block.innerHTML = `<h2 class="lack-people">Пользователи не найдены</h2>`;
        }
}

function GetNewPeoples(){
        param.offset += param.count;

        sendRequest('users.search', param, (data) =>{
                dataPeople = dataPeople.concat(data.response.items);
                CountLoadPeoples = data.response.count;

                GetListPeoples(data.response.items);
        });
}
/*
-----------------------------------------------------------------
                вывод доступоной информации
-----------------------------------------------------------------
*/
function GetMaxInfo(id){
        let data = dataPeople[id];
        let keys = Object.keys(data);

        let form = document.getElementById('data-info');
        let html = '';

        if(data['city'])        data['city']    = data['city'].title;
        if(data['country'])     data['country'] = data['country'].title;
        if(data['career'])      data['career']  = data['career'].company;

        html += `<table class="info">`;

        keys.forEach((item) => {
                if(data[item] && item.indexOf('photo') === -1 && dictionary[item]){
                        html += `<tr class="info__item">
                                        <th class="info_name">
                                                ${dictionary[item]}
                                        </th>
                                        <th class="info_text">
                                                ${data[item]}
                                        </th>
                                </tr>`;
                }
        });

        html += `</table>`;

        form.innerHTML = html;
}

/*
-----------------------------------------------------------
                поиск по городу
-----------------------------------------------------------
*/

let input_country = document.getElementById('country');
if(input_country.value){
    document.getElementById('js-city').classList.remove('_none');
}

input_country.oninput = () => {
    let text = this.value;
    let b = document.getElementById('js-city');

    (text && b.classList.contains('_none')) ? b.classList.remove('_none') : (!text) ? b.classList.add('_none') : '';
}

function GetIdCity(par){
    if(par['country'] && idCountry[par['country']] && par['city']){
        let p = {
            country_id: idCountry[par['country']],
            q: par['city'],
            need_all: 1
        }

        sendRequest('database.getCities', p, (data) => {
                let id = GetCity(par['city'], data.response.items);
                (id !== -1)? param['city'] = id : delete param['city'];
        })
    }else if(!par['city']){
        delete param['city'];
    }
}

function GetCity(city, items){
    if(items.length == 1)
        return items[0].id;

    for(let i = 0; i < items.length; i++)
        if(city.length == items[i].title.length)
            return items[i].id;

    return -1;
}

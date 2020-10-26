// ==UserScript==
// @name         CheckTrueDrugChange
// @name:ru      Выбор правильного ЛС
// @description  Just do it
// @namespace    https://vk.com/omario97
// @version      0.3
// @updateURL    https://raw.githubusercontent.com/SonOfStep/CheckTrueDrugChange/main/index.js
// @authot       Omar "SonOfStep" Nurmakhanov
// @match        *://172.30.149.11:8282/OE/appointment/remsandapps*
// @grant none
// ==/UserScript==

(function() {
  'use strict';
  const TOKEN = $('input[name="YII_CSRF_TOKEN"]').val() //Токен

  /** @descrition Получаем ЛС
* @param {string} Название ЛС, которое мы ищем
* @param {number} Индификатор формы
* @param {string} Токен сессии
* @return {array} Первое ЛС из списка с названием, виде объекта со свойствами id и text
*/
  const getDrug = ( drugName, indificator,token ) => {
    return new Promise (
      ( resolve, reject ) => {

        let request = $.ajax({
          'type': 'GET',
          url: '/OE/appointment/getdrugidbyadid?ima=' + drugName + '&adid=' + indificator + '&YII_CSRF_TOKEN=' + token,
        })

        request.done( msg => { resolve( JSON.parse(msg) ) } )
        request.fail( msg => { reject( msg ) } )
      }
    )
  }
  /** @description
* @param
*/
  const setDrug = ( id, token, text ) => {
    return new Promise (
      ( resolve, reject ) => {
        let request = $.ajax({
          'type': 'POST',
          url: 'http://172.30.149.11:8282/OE/appointment/getnamedzbyrems',
          data: {
            remid: id,
            YII_CSRF_TOKEN: token,
          }
        })
        request.done( msg => {
          resolve( msg )
          $('.dlv_cnt_block').append('<div class="dlv_rems_cntnt_block" data-rid="' + id + '" style="margin-top: 7px;">\n\
<div style="font-size: 9pt; border: 1px solid #aaa; border-radius: 4px; max-width: 60%; min-height: 28px; padding: 4px 8px; display:inline-block">' + text + '</div>\n\
<img class="delete_dlv_btn button_ico img25 right" style="vertical-align: middle;" title="Удалить из списка" src="/OE/assets/df8a2a5e/img/delete2.png" />\n\
<div class="selecttp right wd120" style="vertical-align: middle;"><select class="selectelem deliv_izm">' + msg + '</select></div>\n\
<input value="" placeholder="Укажите дозу..." class="input2 right wd120 inp_dz" style="margin-right: 3px; vertical-align: middle;" />\n\
</div>');
          $('.dlv_rems_cntnt_block:nth-child(1) .delete_dlv_btn').trigger('click')
          $('.dlv_rems_cntnt_block .inp_dz').val($('#tta option:selected').text().slice(19).split(' ')[0])
          $('.dlv_rems_cntnt_block .deliv_izm').val('1')
        } )
        request.fail( msg => reject( msg ) )
      }
    )
  }

  $('#confmovdr').on('click', () => {
    let trueDrugName = $('.nm_block2').text().substr(13)
    let currentDrugName = $('.dlv_rems_cntnt_block').text()
    if ( !( currentDrugName.toLowerCase().includes( trueDrugName.toLowerCase() )) ){
      getDrug( $('.nm_block2').text().substr(13), $('.deliv_detail').data('adid'), TOKEN ).then(
        result => {
          setDrug( result[0].id, TOKEN, result[0].text ).then(
            result => {
              console.log(`Ответ сервера: ${result}`)
            },
            error => console.log(`Ошибка: ${JSON.parse(error)}`)
          )
        },
        error => {console.log(`Ошибка: ${JSON.parse(error)}`) }
      )}

  })

})();

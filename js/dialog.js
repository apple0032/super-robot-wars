var dialogHTML =
    '<div class="dialog dialog-bottom" data-dialog="#dialogType">\n' +
    '        <div class="dialog_pic_container">\n' +
    '            <img src="assets/face/#face.png">\n' +
    '        </div>\n' +
    '        <div class="dialog_speak_container">\n' +
    '          <div class="dialog_speaker">#speaker</div>\n' +
    '          <div class="dialog_speech">#speech</div>\n' +
    '        </div>\n' +
    '        <i class="far fa-hand-point-down" style="font-size: 19px;opacity: 0.4;vertical-align: bottom;margin-bottom: 10px;"></i>\n' +
    '      </div>';


var dialog = {
    "1" : {
        "opening" : [
            {"id" : "1095" ,"target" : "robotID_5_1","name" : "星野琉璃", "speech" : "全機! 突擊!", "pos" : "bot"},
            {"id" : "amuro-1","target" : "robotID_6" , "name" : "呀寶", "speech" : "人類總是重複同樣的錯誤....νガンダムは伊达じゃない！", "pos" : "bot", "focus" : "robotID_6","voice" :"amuro_nugundam"},
            {"id" : "1060","target" : "robotID_3_2" , "name" : "天河明人", "speech" : "遵從艦長指令! 全機.. 突擊!", "pos" : "bot"}
        ]
    }
};
var robot = {
    'player':{
        "robotsElement" : {
            'robotID_3_1': {x: 7, y: 7, robotID: 10, moveLevel: 5, isMoved: false, isDestroyed: false,
                morale : 100,
                weaponsLv : 2,
                weapons :[
                    {
                        "name" : "吐口水",
                        "power" : 10,
                        "range" : 1,
                        "type" : "beam",
                        "afterMove" : false,
                        "isSeep" : false
                    },
                    {
                        "name" : "輕輕一吉",
                        "power" : 500,
                        "range" : 1,
                        "type" : "warri",
                        "afterMove" : true,
                        "isSeep" : false
                    },
                    {
                        "name" : "輕輕一吻",
                        "power" : 1000,
                        "range" : 1,
                        "en" : 1,
                        "type" : "warri",
                        "afterMove" : true,
                        "isSeep" : false,
                        "crt" : 2
                    },
                    {
                        "name" : "輕輕一拳",
                        "power" : 2000,
                        "range" : 1,
                        "type" : "warri",
                        "afterMove" : true,
                        "isSeep" : false
                    },
                    {
                        "name" : "輕輕一炮",
                        "power" : 2400,
                        "range_from": 1,
                        "range" : 2,
                        "ammo" : 0,
                        "total_ammo" : 5,
                        "type" : "beam",
                        "afterMove" : false,
                        "isSeep" : true
                    },
                    {
                        "name" : "Laser Gun",
                        "power" : 3000,
                        "en" : 15,
                        "range_from": 3,
                        "range" : 5,
                        "ammo" : 4,
                        "total_ammo" : 5,
                        "type" : "beam",
                        "afterMove" : false,
                        "isSeep" : false
                    },
                    {
                        "name" : "Laser Sword",
                        "power" : 4500,
                        "en" : 30,
                        "range" : 2,
                        "type" : "warri",
                        "afterMove" : true,
                        "isSeep" : true,
                        "hitRate" : 5,
                        "crt" : 10,
                        "morale" : 100,
                    },
                    {
                        "name" : "天堂與地獄",
                        "power" : 5500,
                        "en" : 60,
                        "range" : 1,
                        "type" : "warri",
                        "afterMove" : true,
                        "isSeep" : true,
                        "hitRate" : 10,
                        "crt" : 30,
                        "morale" : 120,
                        "effect" : [
                            {DEDUCT_ARMOR : "2"},{DEDUCT_MORALE : "1"},
                        ]
                    }
                ]
            },
            'robotID_3_2': {x: 3, y: 3, robotID: 3, moveLevel: 3, isMoved: false, isDestroyed: false,
                weaponsLv : 0,
                weapons :[
                    {
                        "name" : "Laser Sword",
                        "power" : "4000",
                        "en" : "20",
                        "range" : "1"
                    }
                ]
            },
            'robotID_5_1': {x: 3, y: 4, robotID: 5, moveLevel: 3, isMoved: false, isDestroyed: false},
            'robotID_5_2': {x: 10, y: 5, robotID: 6, moveLevel: 3, isMoved: false, isDestroyed: false},
            'robotID_6': {x: 19, y: 15, robotID: 7, moveLevel: 5, isMoved: false, isDestroyed: false,
                weaponsLv : 1,
                weapons :[
                    {
                        "name" : "Laser Gun",
                        "power" : "3000",
                        "en" : "15",
                        "range" : "3",
                        "ammo" : "4",
                        "total_ammo" : "5"
                    },
                    {
                        "name" : "Laser Sword",
                        "power" : "4500",
                        "en" : "30",
                        "range" : "1"
                    }
                ]
            },
            'robotID_7': {x: 1, y: 3, robotID: 10, moveLevel: 3, isMoved: false, isDestroyed: false},
        }
    },
    'ai':{
        "robotsElement" : {
            'robotID_4_1' : {x:19, y:16, robotID: 4, moveLevel : 4, isMoved: false, isDestroyed : false},
            'robotID_4_2' : {x:18, y:15, robotID: 4, moveLevel : 4, isMoved: false, isDestroyed : false},
            'robotID_4_3' : {x:19, y:14, robotID: 4, moveLevel : 4, isMoved: false, isDestroyed : false},
            'robotID_4_4' : {x:21, y:15, robotID: 4, moveLevel : 4, isMoved: false, isDestroyed : false},
            'robotID_5' : {x:2, y:3, robotID: 4, moveLevel : 4, isMoved: false, isDestroyed : false},
        }
    },
    'third':{
        "robotsElement" : {
            'robotID_4_1': {x: 24, y: 2, robotID: 8, moveLevel: 5, isMoved: false, isDestroyed: false},
            'robotID_4_2': {x: 26, y: 3, robotID: 9, moveLevel: 6, isMoved: false, isDestroyed: false},
            'robotID_4_3': {x: 10, y: 6, robotID: 9, moveLevel: 6, isMoved: false, isDestroyed: false},
            //'robotID_4_4': {x: 2, y: 3, robotID: 9, moveLevel: 6, isMoved: false, isDestroyed: false}
        },
        "isAlly" : false
    }
};
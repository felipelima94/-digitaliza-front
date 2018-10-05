self = this;
angular.module('app')
.controller('managerFiles', function($scope, $routeParams, $mdDialog, http, auth, date_Helper, $location){
    
    var toglerightBar = false;

    hideRightBar = () => {
        if(toglerightBar) { 
            document.querySelector('.rightBar').style.display = 'none';
            toglerightBar = !toglerightBar;
        }
        console.log("go hider");
    }
    document.querySelector('.userInfo').addEventListener('click', (e) => {
        if(!toglerightBar) {
            document.querySelector('.rightBar').style.display = 'block';
            toglerightBar = !toglerightBar;
        } else if(toglerightBar) { 
            document.querySelector('.rightBar').style.display = 'none';
            toglerightBar = !toglerightBar;
        }
        e.stopPropagation();
    })
    document.querySelector('.rightBar').addEventListener('click', (e) => {
        e.stopPropagation();
    })
    document.querySelector('body').addEventListener('click', () => {
        if(toglerightBar) {
            document.querySelector('.rightBar').style.display = 'none'
            toglerightBar = !$scope.rightBar;
        }
    });

    self.headers = {
        headers: {
            "Accept": 'application/json',
            "Authorization": JSON.parse(sessionStorage.getItem('token')),
        }
    }

    self.session = {
        usuario_id: "",
        empresa_id: "",
        storage: "",
    }
    // ///////// F O L D E R //////// //
    auth.getUser().then(data => {
        let user = data;
        self.session.usuario_id = user.id;
        
        http.get('/empresa-by-user/'+user.id, self.headers).then(response => {
            console.log(response);
            
            data = response.data;
            console.log(data);
            
            self.session.empresa_id = data.empresa_id;
            let storage = data.storage
            if($routeParams.pasta > 0) {
                storage = $routeParams.pasta
            }
            self.session.storage = storage;
            $scope.getFolders(storage);
        }, error => {
            // window.location.href="/home";
            console.error("Error::Unauthorised");
        })
    });
    // ///////////// C R E A T E  N E W  F O L D E R //////////// //
    $scope.showPrompt = function(ev) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.prompt()
          .title('Criar Nova Pasta')
          .placeholder('Nome da pasta')
          .ariaLabel('Nome da pasta')
          .targetEvent(ev)
          .required(true)
          .ok('Criar')
          .cancel('Cancelar');
    
        $mdDialog.show(confirm).then(function(result) {
            let data = {
                nome: result,
                usuario_id: self.session.usuario_id,
                empresa_id: self.session.empresa_id,
                raiz: self.session.storage
            }
            http.post('/pasta', data, self.headers).then(response => {
                data = response.data;
                $location.url("/files/"+data.id);
            }, error => {
                console.error(error);
            })
        }, function() {});
    };
    // $scope.files = [
    //     {
    //         type: typeFile('folder'),
    //         name: 'Pasta 007',
    //         author: 'James Bond',
    //         date: '07/07/1962',
    //         size: '--'
    //     }
    // ];
    $scope.getFolders = (storage) => {
        console.log(storage);
        $scope.rastro = [];
        http.get('/pasta/rastro/'+storage, self.headers)
        .then(response => {
            console.log("rastro", response);
            
            let rastro = response.data;
            rastro.forEach(r => {
                $scope.rastro.push({
                    link: '/files/'+r.id,
                    nome: r.nome
                })
            })
        })

        $scope.files = []
        http.get('/pasta/'+storage, self.headers)
            .then(response => {
                console.log("pastas", response);
                let folders = response.data;
                
                
                folders.forEach(folder => {
                    lastUpdate = date_Helper.timestampToDate(folder.updated_at);
                    $scope.files.push({
                        'link': "/files/"+folder.id,
                        'type': typeFile('folder'),
                        'name': folder.nome,
                        'author': folder.usuario.first_name,
                        'date': lastUpdate,
                        'size': '--'
                    })
                })
            })
        getDocumentos(storage);
    }

    //////////// D O C U M E N T ////////////////////
    let getDocumentos = storage => {
        http.get('/documentos/'+storage, {headers: {"Authorization": JSON.parse(sessionStorage.getItem('token'))}})
        .then(response => {
            console.log("get document", response)
            docs = response.data
            docs.forEach(doc => {
                
                let date = doc.updated_at;

                // date = date.split(" ")[0];
                // date = date.split("-");
                // lastUpdate = `${date[2]}/${date[1]}/${date[0]}`
                lastUpdate = date_Helper.timestampToDate(date);

                auth.get('/pasta/full-rastro/'+self.session.storage).then(response => {
                    data = response.data;
                    $scope.link = "/documentos/";
                    data.forEach(pasta => {
                        $scope.link += pasta.nome+'/';
                    })

                    $scope.files.push({
                        'type': typeFile(doc.tipo),
                        'name': doc.nome_arquivo,
                        'author': doc.usuario.first_name,
                        'date': lastUpdate,
                        'size': doc.tamanho,
                        'link': http.serverUrl($scope.link+doc.nome_arquivo),
                        'target': '_blank'
                    })
                }, error => console.error(error));
                
                
            });
        }, error => {
            console.error(error);
        });
    }

    $scope.file = [
        {
            type: typeFile('folder'),
            name: 'Pasta 007',
            author: 'James Bond',
            date: '07/07/1962',
            size: '--'
        },
        {
            type: typeFile('folder'),
            name: 'Get Smart',
            author: 'Agente 86',
            date: '18/09/1965',
            size: '--'
        },
        {
            type: typeFile('pdf'),
            name: 'Lista de inimigos.pdf',
            author: 'Agente 86',
            date: '18/05/2018',
            size: '86 KB'
        },
        {
            type: typeFile('pdf'),
            name: 'Novos recrutas.pdf',
            author: 'Agente K',
            date: '21/04/2018',
            size: '25 KB'
        },
        {
            type: typeFile('folder'),
            name: 'Contabilidade',
            author: 'SouljaGirl',
            date: '13/06/2018',
            size: '--'
        },
        {
            type: typeFile('folder'),
            name: 'Videos',
            author: 'SouljaGirl',
            date: '11/06/2018',
            size: '--'
        },
        {
            type: typeFile('pics'),
            name: 'Galera 2017.jpg',
            author: 'SouljaGirl',
            date: '16/02/2018',
            size: '897 KB'
        },
        {
            type: typeFile('pics'),
            name: 'Foto-12884.jpg',
            author: 'SouljaGirl',
            date: '06/08/2017',
            size: '877 KB'
        },
        {
            type: typeFile('pics'),
            name: 'Foto-12235.jpg ',
            author: 'SouljaGirl',
            date: '06/08/2017',
            size: '972 KB'
        },
        {
            type: typeFile('pics'),
            name: 'Foto-12784.jpg',
            author: 'SouljaGirl',
            date: '06/08/2017',
            size: '658 KB'
        },
        {
            type: typeFile('pics'),
            name: 'Fachada da empresa.jpg',
            author: 'SouljaGirl',
            date: '23/11/2017',
            size: '951 KB'
        }
    ]
    // ///////////// DOCUMENT FUNCTION ////////////////// //
    $scope.arrowOrder = "↓"
    $scope.myOrderByName = 'name';
    $scope.orderByName = function(x) {
        if(x == 'name'){
            $scope.arrowOrder = "↑"
            $scope.myOrderByName = '-name';
        } else {
            $scope.arrowOrder = "↓"
            $scope.myOrderByName = 'name';
        }
    }

    // /////////// UPLOAD DOCUMENT //////////////// //
    $scope.simpleUpload = function(ev) {
		$mdDialog.show({
			controller: DialogController,
			templateUrl: '/views/upload/simpleUpload/simpleUpload.html',
			parent: angular.element(document.body),
			targetEvent: ev,
			clickOutsideToClose:true,
			fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
		})
		.then(function(answer) {
			// function answer() in ng-click :: make btn
			// $scope.status = 'You said the information was "' + answer + '".';
		}, function() {
			// função ao fechar
			// $scope.status = 'You cancelled the dialog.';
		});
    };
    
	function DialogController($scope, $mdDialog, $mdToast, $scope, $http, $route) {
		$scope.hide = function() {
			$mdDialog.hide();
		};

		$scope.cancel = function() {
			$mdDialog.cancel();
        };

		$scope.answer = function(answer) {
            // let data = {
            //     'local_armazenado': self.session.storage,
            //     'file': $scope.simpleUpload.file
            // }
            let data = new FormData();
            data.append('local_armazenado', self.session.storage);
            data.append('file', $('#simpleUploadField')[0].files[0])
            // data.append('file', $scope.simpleUpload.file);
            console.log($('#simpleUploadField')[0].files[0]);
            
            
            
            
            headers ={headers: {
                "Authorization": JSON.parse(sessionStorage.getItem('token')),
                "Content-type": undefined,
            }}
            
			if(answer == 'upload') {
                // $http.post("http://192.168.15.24:8000/api/documento", data, {
                //     headers: {
                //         "Authorization": JSON.parse(sessionStorage.getItem('token')),
                //         "Content-type": undefined,
                //     },
                //     transformRequest: angular.identity
                // }).then(function (data, status, headers, config) {
                //     console.log(data);
                    
                // })

				http.post('/documento', data, headers).then(response => {
                    console.log("sending");
                    console.log(response);
                    $scope.hide();
                    $route.reload()
                    
                    // window.location.href="/files/"+self.session.storage;
				}, error => {
                    $scope.errorToast();
                    console.error(error);
                    
				})
			}
			// $mdDialog.hide(answer);
		};

		$scope.errorToast = function() {
		
			$mdToast.show(
			  $mdToast.simple()
				.textContent('Erro ao enviar!')
				.position('bottom right ')
				.hideDelay(5000)
			);
		};
	}
});

function typeFile(type) {
    if(type == "folder") {
        return '/img/folder.png';
    } else if (type == "pics" || type == 'jpg' || type == 'jpeg' || type == 'png' || type == 'gif') {
        return "/img/pics_icon.png";
    } else {
        return "/img/doc.png";
    }
}
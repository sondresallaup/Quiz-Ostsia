	// create the module and name it scotchApp
	var scotchApp = angular.module('scotchApp', ['ngRoute']);

	// configure our routes
	scotchApp.config(function($routeProvider) {
		$routeProvider

			// route for the home page
			.when('/', {
				templateUrl : 'pages/home.html',
				controller  : 'mainController'
			})

			// route for the about page
			.when('/runder', {
				templateUrl : 'pages/rounds.html',
				controller  : 'roundsController'
			})

			// route for the about page
			.when('/runder/:roundId', {
				templateUrl : 'pages/roundsDetail.html',
				controller  : 'roundsDetailController'
			})

			// route for the contact page
			.when('/lag', {
				templateUrl : 'pages/teams.html',
				controller  : 'teamsController'
			})

			// route for the about page
			.when('/lag/:teamId', {
				templateUrl : 'pages/teamDetail.html',
				controller  : 'teamDetailController'
			})

			// route for the login page
			.when('/admin', {
				templateUrl : 'pages/admin.html',
				controller  : 'adminController'
			});
	});

	// create the controller and inject Angular's $scope
	scotchApp.controller('mainController', function($scope) {
		// create a message to display in our view
		$scope.message = 'Everyone come and see how good I look!';

		$scope.login = function() { 
			Parse.User.logIn($scope.credentials.username, $scope.credentials.password, {
			  success: function(user) {
			    $('#loginModal').modal('hide')
				location.reload();
			  },
			  error: function(user, error) {
			    $scope.error = true;
			  }
			});
			};

		var currentUser = Parse.User.current();
		if (currentUser) {
		    $scope.admin = true;
		} else {
		    $scope.admin = false;
		}

		$scope.logout = function() { 
			Parse.User.logOut();
			location.reload();
		}

		$scope.changeCSSGeek = function() {
			document.getElementById("bootstrap-css").href = "https://kristopolous.github.io/BOOTSTRA.386/assets/css/bootstrap.css";
			$scope.geek = true;
		}

		$scope.changeCSSNoGeek = function() {
			document.getElementById("bootstrap-css").href = "http://netdna.bootstrapcdn.com/bootstrap/3.0.0/css/bootstrap.min.css";
			$scope.geek = false;
		}
	});

	scotchApp.controller('roundsController', function($scope) {
		var Round = Parse.Object.extend("Round");
		var roundQuery = new Parse.Query(Round);
		roundQuery.find({
		  success: function(results) {
		    // Do something with the returned Parse.Object values
		    for (var i = 0; i < results.length; i++) { 
		      var object = results[i];
		      document.getElementById('rounds').innerHTML += '<a href="#/runder/' + object.id + '">' + object.get('name') + '</a><br/>';
		    }
		  },
		  error: function(error) {
		    document.getElementById('rounds').innerHTML = ("Error: " + error.code + " " + error.message);
		  }
		});

		$scope.showAddRoundForm = function() {
			$scope.addRoundFormVisible = true;
		}

		$scope.createNewRound = function() {
			var Round = Parse.Object.extend("Round");
			var round = new Round();
			round.set("name", $scope.round.name);
			round.save(null, {
				success: function(round) {
					location.reload();
				},
				error: function(object, error) {
					alert(error.message);
				}
			});

		}
	});

	scotchApp.controller('teamsController', function($scope) {
	    var Team = Parse.Object.extend("Team");
		var teamQuery = new Parse.Query(Team);
		teamQuery.descending("totalPoints");
		teamQuery.find({
			success: function(teams) {
				for(var i = 0; i < teams.length; i++) {
					var team = teams[i];
					document.getElementById('teamsDataTableBody').innerHTML += '<tr><td>' + (i+1) + '</td><td><a href="#/lag/'+ team.id +'">' + team.get('name') + '</a></td><td>' + team.get('totalPoints') + '</td></tr>';
				}
			}
		});
	});

	scotchApp.controller('roundsDetailController', function($scope, $routeParams) {
		var Round = Parse.Object.extend("Round");
		var roundQuery = new Parse.Query(Round);
		roundQuery.get($routeParams.roundId, {
		  success: function(round) {
		    document.getElementById('round').innerHTML = '<h1>' + round.get('name') + '</h1><br/>';

		    var TeamRound = Parse.Object.extend("TeamRound");
			var teamRoundQuery = new Parse.Query(TeamRound);
			teamRoundQuery.equalTo("round", round);
			teamRoundQuery.descending("points");
			teamRoundQuery.find({
				success: function(teamRounds) {
					for(var i = 0; i < teamRounds.length; i++) {
						var teamRound = teamRounds[i];
						document.getElementById('teamsDataTableBody').innerHTML += '<tr><td>' + (i+1) + '</td><td><a href="#lag/'+ teamRound.get("team").id +'">' + teamRound.get('teamName') + '</a></td><td>' + teamRound.get('points') + '</td></tr>';
					}
				}
			});
		  },
		  error: function(object, error) {
		    console.log(error.message);
		  }
		});

		$scope.deleteRound = function() {
			if (confirm('Er du sikker på at vil slette denne runden?')) {
			    
				var Round = Parse.Object.extend("Round");
				var roundQuery = new Parse.Query(Round);
				roundQuery.get($routeParams.roundId, {
				  success: function(round) {
				  		round.destroy({
				  			success: function(round) {
				  				alert("Runde slettet");
				  				window.history.back();
				  			},
				  			error: function(object, error) {
				  				alert(error.message);
				  			}
				  		});
				  }
				});

			}
		}

		$scope.editRound = function() {
			var newRoundName = prompt("Nytt navn");
			if(newRoundName != null) {
				var Round = Parse.Object.extend("Round");
				var roundQuery = new Parse.Query(Round);
				roundQuery.get($routeParams.roundId, {
				  success: function(round) {
				  		round.set("name", newRoundName);
				  		round.save(null, {
				  			success: function(round) {
				  				location.reload();
				  			},
				  			error: function(object, error) {
				  				alert(error.message);
				  			}
				  		});
				  }
				});
			}
		}

		$scope.showAddRoundTeamForm = function() {
			var teamsSelect = document.getElementById("teamsSelect");

			var Team = Parse.Object.extend("Team");
			var teamQuery = new Parse.Query(Team);
			teamQuery.ascending("name");
			teamQuery.find({
				success: function(teams) {
					for(var i = 0; i < teams.length; i++) {
						var team = teams[i];
						teamsSelect.options[i+1] = new Option(team.get("name"), team.id);
						teamsSelect.options[i+1].value = team.id;
					}
				},
				error: function(objects, error) {
					console.log(error.message);
				}
			});

			$scope.addTeamFormVisible = true;
		}

		$scope.addNewTeam = function() {
			var teamsSelect = document.getElementById("teamsSelect");
			var selectedTeam = teamsSelect.options[teamsSelect.selectedIndex].value;

			if(selectedTeam != 0) {
				var Round = Parse.Object.extend("Round");
				var roundQuery = new Parse.Query(Round);
				roundQuery.get($routeParams.roundId, {
					success: function(round) {
						var Team = Parse.Object.extend("Team");
						var teamQuery = new Parse.Query(Team);
						teamQuery.get(selectedTeam, {
							success: function(team) {
								team.set("totalPoints", team.get("totalPoints") + $scope.team.points);
								var TeamRound = Parse.Object.extend("TeamRound");
								var teamRound = new TeamRound();
								teamRound.set("round", round);
								teamRound.set("roundName", round.get("name"));
								teamRound.set("team", team);
								teamRound.set("teamName", team.get("name"));
								teamRound.set("points", $scope.team.points);
								teamRound.save(null, {
									success: function(teamRound) {
										location.reload();
									},
									error: function(object, error) {
										alert(error.message);
									}
								});
							}
						})
					}
				});
			}
			else {
				var Round = Parse.Object.extend("Round");
				var roundQuery = new Parse.Query(Round);
				roundQuery.get($routeParams.roundId, {
					success: function(round) {
						var Team = Parse.Object.extend("Team");
						var team = new Team();
						team.set("name", $scope.team.name);
						team.set("totalPoints", $scope.team.points);
						team.save(null, {
							success: function(team) {
								var TeamRound = Parse.Object.extend("TeamRound");
								var teamRound = new TeamRound();
								teamRound.set("round", round);
								teamRound.set("roundName", round.get("name"));
								teamRound.set("team", team);
								teamRound.set("teamName", team.get("name"));
								teamRound.set("points", $scope.team.points);
								teamRound.save(null, {
									success: function(teamRound) {
										location.reload();
									},
									error: function(object, error) {
										alert(error.message);
									}
								});
							}
						})
					}
				});
			}
		}
	});

	scotchApp.controller('teamDetailController', function($scope, $routeParams) {
		var Team = Parse.Object.extend("Team");
		var teamQuery = new Parse.Query(Team);
		teamQuery.get($routeParams.teamId, {
		  success: function(team) {
		    document.getElementById('team').innerHTML = '<h1>' + team.get('name') + '</h1><br/>';

		    var TeamRound = Parse.Object.extend("TeamRound");
			var teamRoundQuery = new Parse.Query(TeamRound);
			teamRoundQuery.equalTo("team", team);
			teamRoundQuery.descending("createdAt");
			teamRoundQuery.find({
				success: function(teamRounds) {
					for(var i = 0; i < teamRounds.length; i++) {
						var teamRound = teamRounds[i];
						document.getElementById('teamDataTableBody').innerHTML += '<tr><td><a href="#runder/'+ teamRound.get("round").id +'">' + teamRound.get('roundName') + '</a></td><td>' + teamRound.get('points') + '</td><td>' + "plassering" + '</td></tr>';
					}
				}
			});
		  },
		  error: function(object, error) {
		    console.log(error.message);
		  }
		});

		$scope.deleteTeam = function() {
			if (confirm('Er du sikker på at vil slette denne runden?')) {
			    
				var Team = Parse.Object.extend("Team");
				var teamQuery = new Parse.Query(Team);
				teamQuery.get($routeParams.teamId, {
				  success: function(team) {
				  		team.destroy({
				  			success: function(team) {
				  				alert("Lag slettet");
				  				window.history.back();
				  			},
				  			error: function(object, error) {
				  				alert(error.message);
				  			}
				  		});
				  }
				});

			}
		}

		$scope.editTeam = function() {
			var newTeamName = prompt("Nytt navn");
			if(newTeamName != null) {
				var Team = Parse.Object.extend("Team");
				var teamQuery = new Parse.Query(Team);
				teamQuery.get($routeParams.teamId, {
				  success: function(team) {
				  		team.set("name", newTeamName);
				  		team.save(null, {
				  			success: function(team) {
				  				location.reload();
				  			},
				  			error: function(object, error) {
				  				alert(error.message);
				  			}
				  		});
				  }
				});
			}
		}
	});

	Parse.initialize("RXgU6JDo0x5joT9gK56Vb60OMS1aF7bD4zTjtLSr", "2YwpWyQVWmbDnSmw2dlijRi0WS06HaiHglYAIpzc");
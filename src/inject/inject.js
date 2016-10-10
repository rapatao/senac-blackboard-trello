chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
		if (document.readyState === "complete") {
			clearInterval(readyStateCheckInterval);

			// ----------------------------------------------------------
			// This part of the script triggers when page is done loading
			// ----------------------------------------------------------

			Trello.authorize({
				type: 'popup',
				name: 'Senac Blackboard Trello integration',
				scope: {
					read: 'true',
			    	write: 'true' 
				},
				expiration: 'never'
			});

			var boardKey = 'ZZ9VHAJo';
			var aula = document.querySelector('#pageTitleHeader').innerText;

			var label = document.querySelector('#courseMenu_link').innerText;
				label = label.replace(/.*-/, '').replace(/\)/,'');
			
			function rapatsCreateCard(url, label, name, itens) {
				console.log('Label: ' + label);
				console.log('Card name: ' + name);
				console.log('Description: ' + url);

				
				Trello.get('/boards/' + boardKey + '/lists',
					function success(boardListsRes) {

						Trello.post('/cards/', { name: name, desc: url, idList: boardListsRes[0].id }, 
							function success(cardRes) {

								Trello.post('/checklists', { idCard: cardRes.id },
									function success(checklistRes) {
										for (i = 0; i < itens.length; i++) { 
											var item = itens[i].innerText; 
											if (item.length > 0) {
												console.log('Item: ' + item);
												Trello.post('/checklists/' + checklistRes.id + '/checkItems', { name: item });
											} 
										}

										Trello.get('/boards/'+boardKey+'/labels',
											function success(labelsRes) {
												var labelId = null;
												for (i = 0; i < labelsRes.length; i++) {
													if (labelsRes[i].name == label) {
														labelId = labelsRes[i].id;
													}
												}
												console.log('Label id: ' + labelId);
												Trello.post('/cards/' + cardRes.id + '/idLabels',
												//Trello.post('/cards/' + cardRes.id + '/labels',
													{ value: labelId },
													function success(cardLabelres) {
													},
													function fail(cardLabelres) {
														console.log(cardLabelres);
													}
												);
											},
											function fail(labelsRes) {
												console.log(labelsRes);
											}
										);


									},
									function fail(checklistRes) {
										console.log(checklistRes);
									}
								);
							},
							function fail(res) {
								console.log('Trello fail: ');
								console.log(res);
							}
						);
					},
					function fail(res) {
						console.log(res);
					}
				);			
				
				/**/
			}

			function rapatsCreateTrelloCard() {
				var url = window.location.toString();

				

				var itens = document.querySelectorAll('#content_listContainer li.clearfix div.item h3 span');
				rapatsCreateCard(url, label, aula, itens);
				
			}

			if (aula.match('Aula [0-9].*')) {
				var creatorEl = document.createElement('button');
				creatorEl.innerText = 'create trello task';
				document.body.insertBefore(creatorEl, document.body.childNodes[0]);
				creatorEl.onclick = rapatsCreateTrelloCard;		
			}

		}
	}, 10);



});

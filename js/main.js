$(function(){

  	// click event to add list item
	$('#increment div:first').click(() => {

		// append new textarea inside #items div
		const newTextArea = '<textarea rows="1" form="submit" placeholder="Start typing..." spellcheck="false" class="increment"></textarea>'
		$('div#items').append(newTextArea)

	})

 
	// click event to remove list item
	$('#increment div:last').click(() => {

		// remove last textarea with class .increment
		// first two textareas do not have class .increment
		$('div#items textarea.increment:last').remove()

	})


	// input event to resize input textareas to fit text
	// cannot use $(this) with arrow function
	$('body').on('input', '#input textarea', function() {
		$(this)[0].style.height = $(this)[0].scrollHeight + 'px'
	})


	// submit event to run program
	$('#submit').submit((event) => {

		event.preventDefault()
		console.log('Form submitted')

		// create counting variables
		let itemCount = 0
		let replacedPatternsFlags = 0
		let detectedCodeFlags = 0

		// create variable for array of list items
		const $items = $('#items textarea')

		$.each($items, function(index, input) {

			const item = input.value.trim()

			if (item) {

				// count items in itemCount variable
				itemCount = itemCount + 1

				// check if items include code
				const replacedPatterns = ['><', 'css">ul', 'css">ol', '!important;} li', '!important;}<', '<li class', '<li style', 'ul {margin', 'li {margin', 'li\.firstListItem', 'li\.lastListItem']
				const detectedCode = ['<table', '<img', '<h1']

				replacedPatterns.forEach(function(pattern) {
					result = checkForPatterns(item, pattern)
					if (result === true) {
						replacedPatternsFlags = replacedPatternsFlags + 1
					}
				})

				detectedCode.forEach(function(code) {
					result = checkForPatterns(item, code)
					if (result === true) {
						detectedCodeFlags = detectedCodeFlags + 1
					}
				})

			}

		})

		// log counting variables
		console.log(`Item count: ${itemCount}`)
		console.log(`Replaced patterns flags: ${replacedPatternsFlags}`)
		console.log(`Detected code flags: ${detectedCodeFlags}`)

		// program only runs if user submits at least two items
		// and if none of their input will be replaced by the program
		if (itemCount > 1 && replacedPatternsFlags === 0) {

			// clear error message
			$('#error').text('')

			// modal warning for any detected code
			if (detectedCodeFlags > 0) {
				$('#dialog').dialog('open')
			}

			// create variables for list styles
			const listMarker = $('select')[0].value
			console.log(`List marker: ${listMarker}`)

			// call getSpacing()
			// inputs do not allow negative numbers
			const indent = getSpacing('indent', 40)
			console.log(`Left indent: ${indent}px`)

			const spaceBetween = getSpacing('spaceBetween', 10)
			console.log(`Space between items: ${spaceBetween}px`)

			const spaceAboveBelow = getSpacing('spaceAboveBelow', 20)
			console.log(`Space above and below list: ${spaceAboveBelow}px`)

			/* -------------------------------- */

			// create empty array for bare li strings
			const bareLis = []

			// wrap each item in html li tag
			// push each li tag, as a string, to empty bareLis array
			$.each($items, function(index, input) {

				const item = input.value.trim()

				if (item) {
					console.log(`List item: ${item}`)
					const itemHtml = `<li>${item}</li>`
					bareLis.push(itemHtml)
				}

			})

			// create array of true html li tags
			let styledLis = bareLis.join('')
			styledLis = $.parseHTML(styledLis)

			/* -------------------------------- */

			// add bottom margins to all li tags
			// creates space between list items
			styledLis.forEach(function(li) {
				li.style.margin = `0 0 ${spaceBetween}px`
				li.style.textAlign = 'left'
			})

			// style last item
			// make bottom margin 0 to override gmail default
			// add class 'lastListItem'
			const lastLi = styledLis.pop()
			lastLi.style.margin = 0
			lastLi.className = 'lastListItem'
			styledLis.push(lastLi)

			// style first item
			// add class 'firstListItem'
			const firstLi = styledLis.shift()
			firstLi.className = 'firstListItem'
			styledLis.unshift(firstLi)

			/* -------------------------------- */

			// create global listTag variable based on listMarker variable
			if (listMarker === 'decimal' || listMarker === 'upper-alpha' || listMarker === 'lower-alpha') {
				var listTag = 'ol'
			} else {
				var listTag = 'ul'
			}

			// create and style list html array
			let html = `<${listTag} align="left"></${listTag}>`
			html = $.parseHTML(html)
			html = html[0]
			html.style.listStyleType = listMarker
			html.style.padding = `0 0 0 ${indent}px`
			html.style.margin = `${spaceAboveBelow}px 0`
			if (indent === 0) {
				html.style.listStylePosition = `inside`
			}

			/* -------------------------------- */

			// inject styledLis into list html array
			styledLis.forEach(function(li) {
				html.appendChild(li)
			})

			// log, format and display output HTML
			html = html.outerHTML
			console.log(`HTML: ${html}`)
			html = breakLinesInHtml(html)
			html = indentHtml(html)
			$('#output textarea:last').text(html)

			/* -------------------------------- */

			// log, format and display output mso
			mso = `<!--[if mso]><style type="text/css">${listTag} {margin:0 !important;} li {margin-left:${indent}px !important;} li.firstListItem {margin-top:${spaceAboveBelow}px !important;} li.lastListItem {margin-bottom:${spaceAboveBelow}px !important;}</style><![endif]-->`
			console.log(`mso: ${mso}`)
			mso = breakLinesInMso(mso)
			mso = indentMso(mso)
			$('#output textarea:first').text(mso)

			/* -------------------------------- */

			// resize output textareas to fit text
			$('#output textarea:last')[0].style.height = $('#output textarea:last')[0].scrollHeight + 5 + 'px'
			$('#output textarea:first')[0].style.height = $('#output textarea:first')[0].scrollHeight + 5 + 'px'

		} else if (itemCount < 2) {

			// error if user submits less than two items
			$('#error').text('Your list needs at least two items.')

		} else {

			// error if items contain replaced patterns
			$('#error').text('Something went wrong.')

		}


	})

	// get list spacing
	const getSpacing = (style, fallback) => {
		if ($("input[name=" + style + "]").val().length === 0) {
			return fallback
		} else {
			return $("input[name=" + style + "]").val()
		}
	}

	// break lines in html
	const breakLinesInHtml = html => {
		return html.replace(/></gi, '>\n<')
	}

	// break lines in mso
	const breakLinesInMso = mso => {
		mso = breakLinesInHtml(mso)
		mso = mso.replace(/css">ul/gi, 'css">\nul')
		mso = mso.replace(/css">ol/gi, 'css">\nol')
		mso = mso.replace(/!important;} li/gi, '!important;}\nli')
		mso = mso.replace(/!important;}</gi, '!important;}\n<')
		return mso
	}

	// indenter function
	const indent = (code, replaceThis) => {
		const regex = new RegExp(replaceThis, "gi")
		code = code.replace(regex, '  $&')
		return code
	}

	// indent html
	const indentHtml = html => {
		patternsToIndent = ['<li class', '<li style']
		// run indenter function on each pattern
		patternsToIndent.forEach(function(pattern) {
			html = indent(html, pattern)
		})
		return html
	}

	// indent mso
	const indentMso = mso => {
		patternsToIndent = ['ul {margin', 'li {margin', 'li\.firstListItem', 'li\.lastListItem']
		// run indenter function on each pattern
		patternsToIndent.forEach(function(pattern) {
			mso = indent(mso, pattern)
		})
		return mso
	}

	// check if a string includes a pattern
	const checkForPatterns = (string, pattern) => {
		if (string.includes(pattern)) {
			return true
		} else {
			return false
		}
	}

	// jquery dialog widget -- api.jqueryui.com/dialog
	$('#dialog').text('Warning: The HTML in your list items might cause your list to render improperly.')
    $('#dialog').dialog({
    	autoOpen: false,
    	// hide X button
    	dialogClass: "no-close",
    	// disable rest of page
    	modal: true,
    	closeOnEscape: false,
    	buttons: [
    		{
    			text: 'Go Back',
    			click: function() {
    				$(this).dialog('close')
    				// clear output textareas
    				$('#output textarea').text('')
    				// resize output textareas to original
    				$('#output textarea:last')[0].style.height = '102px'
    				$('#output textarea:first')[0].style.height = '102px'
    			}
		    },
    		{
    			text: 'Proceed',
    			click: function() {
    				$(this).dialog('close')
    			}
		    }
		]
    })


})



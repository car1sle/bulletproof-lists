$(function(){

  	// click event to add list item
	$('#increment div:first').click(() => {

		// append new textarea inside #items div
		const newTextArea = '<textarea rows="1" form="submit" placeholder="Start typing..." spellcheck="false" class="increment"></textarea>'
		$('div#items').append(newTextArea)

		if($('div#items textarea').length > 2 && $('#increment .minus').hasClass('hidden')){
			$('#increment .minus').toggleClass('hidden')
		}

	})

	// click event to remove list item
	$('#increment div:last').click(() => {

		// remove last textarea with class .increment
		// first two textareas do not have class .increment
		$('div#items textarea.increment:last').remove()

		if($('div#items textarea').length <= 2){
			$('#increment .minus').toggleClass('hidden')
		}
	})

	// input event to resize input textareas to fit text
	// cannot use $(this) with arrow function
	$('body').on('input', '#input textarea', function() {
		$(this)[0].style.height = $(this)[0].scrollHeight + 'px'
	})

	// copy output mso to clipboard
	$('#mso button').click(() => {
		console.log('mso copied to clipboard')
		copy('#mso textarea')
	})

	// copy output html to clipboard
	$('#html button').click(() => {
		console.log('html copied to clipboard')
		copy('#html textarea')
	})

	// submit event
	$('#submit').submit((event) => {

		event.preventDefault()
		console.log('Form submitted')

		// create counting variables
		let itemCount = 0
		let codeBreakerCount = 0
		let warningCount = 0

		// create variable for array of list items
		const items = getItems()

		$.each(items, function(index, input) {

			const item = input.value.trim()

			if (item) {

				// count items
				itemCount = itemCount + 1

				// patterns that the program will replace
				// in order to style the output code
				const replacedPatterns = [
					'><',
					'<li class',
					'<li style',
					'ul {margin',
					'ol {margin',
					'li {margin',
					'li\.firstListItem',
					'li\.lastListItem'
				]

				// patterns that will break the program
				const codeBreakers = [
					'<table','</table>',
					'<tbody', '</tbody>',
					'<thead', '</thead>',
					'<tfoot', '</tfoot>',
					'<tr>', '</tr>',
					'<td', '</td>',
					'<th', '</th>',
					'<div', '</div>',
					'<img',
					'<hr>',
					'<h1', '</h1>',
					'<h2', '</h2>',
					'<h3', '</h3',
					'<h4', '</h4',
					'<h5', '</h5',
					'<p', '</p>',
					'<button', '</button>',
					'<pre>', '</pre>',
					'<blockquote', '</blockquote>',
					'<!--', '-->',
					'<embed',
					'<label', '</label>',
					'<svg', '</svg>'
				]

				// patterns that might break the program
				const warnings = [
					'<br>', '<br/>', '<br />',
					'<span', '</span>',
					'style="',
					'align="',
					'!important',
					'href="',
					'<a', '</a>',
					'<sup', '</sup>',
					'<sub', '</sub>',
					'text-align:',
					'<abbr', '</abbr>',
					'<address', '</address>',
					'<bdo', '</bdo>',
					'<font', '</font>',
					'<small', '</small>'
				]

				// if replacedPattern, update codeBreakerCount
				replacedPatterns.forEach(function(pattern) {
					result = checkForMatch(item, pattern)
					if (result === true) {
						codeBreakerCount = codeBreakerCount + 1
					}
				})

				// if codeBreaker, update codeBreakerCount
				codeBreakers.forEach(function(breaker) {
					result = checkForMatch(item, breaker)
					if (result === true) {
						codeBreakerCount = codeBreakerCount + 1
					}
				})

				// if warning, update warningCount
				warnings.forEach(function(warning) {
					result = checkForMatch(item, warning)
					if (result === true) {
						warningCount = warningCount + 1
					}
				})

			}

		})

		// log counts
		console.log(`Item count: ${itemCount}`)
		console.log(`Code breaker count: ${codeBreakerCount}`)
		console.log(`Warning count: ${warningCount}`)

		// program only runs if user submits at least two items
		// and if none of their input will be replaced by, or break, the program
		if (itemCount > 1 && codeBreakerCount === 0) {

			// open dialog box for any warnings
			if (warningCount > 0) {
				$('#dialog').dialog('open')
				console.log('Warning issued')
			} else {
				runProgram()
			}


		} else if (itemCount < 2) {

			// error if user submits less than two items
			$('#error').text('Your list needs at least two items.')
			console.log('Program did not run')

		} else {

			// error if items contained replacedPatterns or codeBreakers
			$('#error').text('Something went wrong.')
			console.log('Program did not run')

		}


	})

	// run program
	const runProgram = () => {

		console.log('Running program')
		const items = getItems()

		// clear error message
		$('#error').text('')

		// get old output
		const oldHtml = $('#output textarea:last').text()
		const oldMso = $('#output textarea:first').text()

		// create variables for list styles
		const listMarker = $('select')[0].value
		console.log(`List marker: ${listMarker}`)

		// call getSpacing()
		// inputs do not allow negative numbers
		const indent = getSpacing('indent', 40)
		const msoIndent = parseInt(indent)
		console.log(`Left indent: ${indent}px`)
		console.log(`Mso indent: ${msoIndent}px`)

		const spaceBetween = getSpacing('spaceBetween', 10)
		console.log(`Space between items: ${spaceBetween}px`)

		const spaceAboveBelow = getSpacing('spaceAboveBelow', 20)
		console.log(`Space above and below list: ${spaceAboveBelow}px`)

		/* -------------------------------- */

		// create empty array for bare li strings
		const bareLis = []

		// wrap each item in html li tag
		// push each li tag, as a string, to empty bareLis array
		$.each(items, function(index, input) {

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
			$(li).attr('style','text-align: left; mso-special-format: bullet; margin: 0 0 ' + spaceBetween + 'px;')
		})

		// style last item
		// make bottom margin 0 to override gmail default
		// add class 'lastListItem'
		const lastLi = styledLis.pop()
		$(lastLi).attr('style','text-align: left; mso-special-format: bullet; margin: 0;')
		lastLi.className = 'lastListItem'
		styledLis.push(lastLi)

		// style first item
		// add class 'firstListItem'
		const firstLi = styledLis.shift()
		firstLi.className = 'firstListItem'
		styledLis.unshift(firstLi)

		/* -------------------------------- */

		// create global listTag variable based on listMarker variable
		// must delcare with let
		if (listMarker === 'decimal' || listMarker === 'upper-alpha' || listMarker === 'lower-alpha') {
			var listTag = 'ol'
		} else {
			var listTag = 'ul'
		}

		// create and style list html array
		let html = `<${listTag} align="left"></${listTag}>`
		html = $.parseHTML(html)
		html = html[0]
		$(html).attr('style','list-style-type: ' + listMarker + '; padding: 0 0 0 ' + indent + 'px; margin: ' + spaceAboveBelow + 'px 0;')

		/* -------------------------------- */

		// inject styledLis into list html array
		styledLis.forEach(function(li) {
			html.appendChild(li)
		})

		// log, format and display output html
		html = html.outerHTML
		console.log(`HTML: ${html}`)
		html = breakLines(html)
		html = indentHtml(html)
		$('#output textarea:last').text(html)

		/* -------------------------------- */

		// log, format and display output mso
		mso = `<!--[if mso]><style type="text/css">\n${listTag} {margin: 0 !important;}\nli {margin-left: ${msoIndent}px !important;}\nli.firstListItem {margin-top: ${spaceAboveBelow}px !important;}\nli.lastListItem {margin-bottom: ${spaceAboveBelow}px !important;}\n</style><![endif]-->`
		console.log(`mso: ${mso}`)
		mso = breakLines(mso)
		mso = indentMso(mso)
		$('#output textarea:first').text(mso)

		/* -------------------------------- */

		// reveal copy to clipboard buttons
		$('#output button').show()
		$('#output button').css({
			display: 'block',
			marginTop: '5px',
			marginBottom: '10px'
		})

		// if new output, resize textareas to fit text
		if (oldHtml != html) {
			$('#output textarea:last')[0].style.height = $('#output textarea:last')[0].scrollHeight + 5 + 'px'
		}
		if (oldMso != mso) {
			$('#output textarea:first')[0].style.height = $('#output textarea:first')[0].scrollHeight + 5 + 'px'
		}
	}

	// get items array
	const getItems = () => {
		const $items = $('#items textarea')
		return $items
	}

	// get list spacing
	const getSpacing = (style, fallback) => {
		// if user didnt enter spacing values, return default as fallback
		if ($("input[name=" + style + "]").val().length === 0) {
			return fallback
		} else {
			return $("input[name=" + style + "]").val()
		}
	}

	// break lines in output code
	const breakLines = code => {
		return code.replace(/></gi, '>\n<')
	}

	// indent output code
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
		patternsToIndent = ['ul {margin', 'ol {margin', 'li {margin', 'li\.firstListItem', 'li\.lastListItem']
		// run indenter function on each pattern
		patternsToIndent.forEach(function(pattern) {
			mso = indent(mso, pattern)
		})
		return mso
	}

	// check if a string includes a pattern
	const checkForMatch = (string, pattern) => {
		if (string.includes(pattern)) {
			return true
		} else {
			return false
		}
	}

	// copy textarea to clipboard
	const copy = (areaSelector) => {
		const textArea = document.querySelector(areaSelector)
		textArea.select()
		document.execCommand('copy')
    	// select corresponding button using adjacent sibling selector
    	const copyButtonSelector = areaSelector + ' + button'
    	const copyButton = document.querySelector(copyButtonSelector)
    	// confirm copy success in button text
    	copyButton.innerHTML = 'Copied!'
    	// after two seconds, revert to copy prompt
    	setTimeout(function() {
    		copyButton.innerHTML = 'Copy to clipboard'
    		// revert default highlighting of textarea
	    	textArea.setSelectionRange(0, 0)
	    	textArea.blur()
    	}, 1000)
	}

	// jquery dialog widget -- api.jqueryui.com/dialog
	$('#dialog').html('<span class="ui-icon ui-icon-alert"></span>&nbsp;Your list items contain code that will cause your list to render improperly.')
    $('#dialog').dialog({
    	autoOpen: false,
    	// hide X buttons
    	dialogClass: "no-close",
    	// disable rest of page
    	modal: true,
    	closeOnEscape: false,
    	minHeight: false,
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
    				runProgram()
    			}
		    }
		]
    })

})

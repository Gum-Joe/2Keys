/**
 * Util function to make things titlecase.
 * From https://www.freecodecamp.org/news/three-ways-to-title-case-a-sentence-in-javascript-676a9175eb27/
 */
export default function titleCase(str) {
	// Step 1. Lowercase the string
	str = str.toLowerCase() // str = "i'm a little tea pot";

		// Step 2. Split the string into an array of strings
		.split(" ") // str = ["i'm", "a", "little", "tea", "pot"];

		// Step 3. Map over the array
		.map(function (word) {
			return word.replace(word[0], word[0].toUpperCase());
			/* Map process
			1st word: "i'm" => word.replace(word[0], word[0].toUpperCase());
												 "i'm".replace("i", "I");
												 return word => "I'm"
			2nd word: "a" => word.replace(word[0], word[0].toUpperCase());
											 "a".replace("a", "A");
												return word => "A"
			3rd word: "little" => word.replace(word[0], word[0].toUpperCase());
														"little".replace("l", "L");
														return word => "Little"
			4th word: "tea" => word.replace(word[0], word[0].toUpperCase());
												 "tea".replace("t", "T");
												 return word => "Tea"
			5th word: "pot" => word.replace(word[0], word[0].toUpperCase());
												 "pot".replace("p", "P");
												 return word => "Pot"                                                        
			End of the map() method */
		});

	// Step 4. Return the output
	return str.join(" "); // ["I'm", "A", "Little", "Tea", "Pot"].join(' ') => "I'm A Little Tea Pot"
}
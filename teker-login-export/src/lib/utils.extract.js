// Extracto de lib/utils.js (solo lo que usa el login)

export const keyJWT = new TextEncoder().encode(process.env.JWT_SECRET);

export const maskInformation = (input, type) => {
  let censoredResult = null;

  if (!input) return "Unknown";
  if (!type) return input.replace(/[a-zA-ZáéíóúÁÉÍÓÚ]/g, "*");

  if (type === "name") {
    const words = input.split(" ");

    // Process each word in the array
    const censoredWords = words.map((word) => {
      // Replace all characters in the word, except the first one, with '*'
      const censoredPart = word.length > 1 ? "*".repeat(word.length - 1) : "";

      // Combine the first letter with the censored part
      return word.charAt(0) + censoredPart;
    });

    // Join the censored words back into a string
    censoredResult = censoredWords.join(" ");
  }

  if (type === "id") {
    const firstTwo = input.slice(0, 1);
    const lastTwo = input.slice(-2);

    // Replace the middle digits with asterisks
    const censoredMiddle = "*".repeat(input.length - 3);

    // Construct the censored ID number
    censoredResult = `${firstTwo}${censoredMiddle}${lastTwo}`;
  }

  if (type === "email") {
    const [username, domain] = input.split("@");

    // Censor username (show only the first letter)
    const censoredUsername =
      username.charAt(0) + "*".repeat(username.length - 1);

    // Combine censored username and original domain
    censoredResult = `${censoredUsername}@${domain}`;
  }

  if (type === "phone") {
    const firstTwo = input.slice(0, 1);
    const lastTwo = input.slice(-2);

    // Censor the middle digits
    const censoredMiddle = input.slice(1, -2).replace(/\d/g, "*");

    // Combine the censored parts
    // censoredResult = firstTwo + censoredMiddle + lastTwo;
    censoredResult = `${firstTwo}${censoredMiddle}${lastTwo}`;
  }

  return censoredResult;
};

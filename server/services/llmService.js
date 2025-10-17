const {GoogleGenAI} = require("@google/genai");

const ai = new GoogleGenAI({apiKey:process.env.LLM_API_KEY});

const ALLERGEN_LIST = [
    'Glutén', 
    'Rákfélék', 
    'Tojás', 
    'Hal', 
    'Földimogyoró', 
    'Szója', 
    'Tej', 
    'Diófélék',
    'Zeller', 
    'Mustár'
];

const NUTRIENT_LIST = [
      'Energia',
      'Zsír',
      'Szénhidrát',
      'Cukor' ,
      'Fehérje',
      'Nátrium'     
];


exports.extractDataFromText = async (text) => {
const prompt = `Kérem, a következő termékleírás szövegéből nyerje ki az adatokat. A dokumentum lehet magyar, angol vagy más nyelvű.

      1.  **Minden kinyert adatot (terméknév, jellemzők stb.)** kötelezően **fordítson le magyarra**, függetlenül a forrás nyelvétől.
      2.  A kimenet egyetlen JSON objektum legyen, és SOHA ne térjen el a megadott JSON sémától.
      3.  A sémában szereplő **'nyelv'** mező értékeként adja vissza **pontosan a forrásdokumentum eredeti nyelvét** (pl. 'Polish', 'Magyar', 'English'). Ez az egyetlen mező, amit nem szabad lefordítani.
      
      Nyers szöveg a feldolgozáshoz:
      """
      ${text}
      """`;

      const responseSchema = {
        type: "object",
        properties: {
            termék_neve: { type: "string", description: "A termék hivatalos neve." },
            allergének: { 
                type: "array", 
                items: { type: "string" },
                description: `A szövegben előforduló allergének, de csak a következő listából: [${ALLERGEN_LIST.join(', ')}].`
            },
            tápértékek: {
                type: "array",
                description: "A tápérték táblázat adatainak kulcs/érték párokká alakított listája.",
                items: {
                    type: "object",
                    properties: {
                        jellemző: { type: "string", enum: NUTRIENT_LIST },
                        mennyiség_100g: { type: "string", description: "Az érték és az egység (pl. 1000 kJ / 239 kcal, 10 g)." }
                    },
                    required: ["jellemző", "mennyiség_100g"]
                }
            },
            nyelv: { type: "string", description: "A forrásdokumentum nyelve (pl. Magyar, Angol, Német)." }
        },
        required: ["termék_neve", "allergének", "tápértékek", "nyelv"]
      };

      try {
            const response = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: [{ role: 'user', parts: [{ text: prompt }] }],
                  config: {
                  responseMimeType: "application/json",
                  responseSchema: responseSchema,
                  }
            });

            return JSON.parse(response.text);

      } catch (error) {
            console.error(`Error during AI data extraction: ${error}`);
            throw new Error('AI data extraction failed');
      }
}
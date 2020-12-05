import { calculateExpirationDate, validateDAC10, decodeConvenioDigits, decodeTituloDigits, parseAmount, transformToBarcode, validateDV123 } from "../../helpers/boleto.helpers";

describe("Successfully calculates a expiration date", () => {
    it("should return a valid string date", () => {
      const factor = 7587;
  
      const result = calculateExpirationDate(factor);
  
      expect(result).toEqual("2018-07-16");
    });
});

describe("Successfully calculates the general DAC using module 10 rules", () => {
    it("should return true", () => {
        const field1 = "846700000017";
        const field2 = "435900240209";
        const field3 = "024050002435";
        const field4 = "842210108119";
        const dac = "7";
  
        const result = validateDAC10(`${field1.slice(0,3)+field1.slice(4).slice(0, -1)}${field2.slice(0, -1)}${field3.slice(0, -1)}${field4.slice(0, -1)}`, dac);
  
        expect(result).toBe(true);
    });
});

describe("Successfully decode convenio digits in 4 fields and 1 general DAC", () => {
    it("should a string array with length 5", () => {  
        const result = decodeConvenioDigits("846700000017435900240209024050002435842210108119");
  
        expect(result).toEqual([
            "7",
            "846700000017",
            "435900240209",
            "024050002435",
            "842210108119"
        ]);
    });
});

describe("Successfully decode titulo digits in 4 fields and 1 DV", () => {
    it("should a string array with length 5", () => {  
        const result = decodeTituloDigits("21290001192110001210904475617405975870000002000");

        expect(result).toEqual([
            "2129000119",
            "21100012109",
            "04475617405",
            "9",
            "75870000002000"
        ]);
    });
});

describe("Successfully parses the amount of any boleto", () => {
    it("should a string with the amount", () => {  
        const result = parseAmount("0000002000");

        expect(result).toEqual("20,00");
    });
});

describe("Successfully transforms a digitable line into a barcode (titulos)", () => {
    it("should a string with the barcode", () => {  
        const result = transformToBarcode(["2129000119","21100012109","04475617405","9","75870000002000"]);

        expect(result).toEqual("21299758700000020000001121100012100447561740");
    });
});

describe("Successfully calculates the DV from fields 1, 2 and 3 (titulos)", () => {
    it("should return true", () => {
        const result = validateDV123("2129000119");
  
        expect(result).toBe(true);
    });
});

describe("Unsuccessfully calculates the DV from fields 1, 2 and 3 (titulos)", () => {
    it("should return false", () => {
        const result = validateDV123( "2129000118");
  
        expect(result).toBe(false);
    });
});
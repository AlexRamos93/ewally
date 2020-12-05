import { validateTituloDigits, validateConvenioDigits } from "../../helpers/boleto.helpers";

describe("Successfully reads a boleto de titulos", () => {
  it("should return a object with expirationdate, barcode and amount", () => {
    const boletoNumber = "21290001192110001210904475617405975870000002000";

    const result = validateTituloDigits(boletoNumber);

    expect(result).toEqual({
      barCode: "21299758700000020000001121100012100447561740",
      amount: "20,00",
      expirationDate: "2018-07-16",
    });
  });
});

describe("Unsuccessfully reads a boleto de titulos", () => {
  it("should return that dv is invalid", () => {
    const boletoNumber = "21290001192110001521090447561740597587000000200";
    
    expect(() => {
      validateTituloDigits(boletoNumber)
    }).toThrow();
  });
});

describe("Successfully reads a boleto de convenio", () => {
  it("should return a object with expirationdate, barcode and amount", () => {
    const boletoNumber = "856900000584030100649158110347945609001374691358";

    const result = validateConvenioDigits(boletoNumber);

    expect(result).toEqual({
      barCode: "85690000058030100649151103479456000137469135",
      amount: "5803,01",
      expirationDate: ""
    });
  });
});

describe("Unsuccessfully reads a boleto de convenio", () => {
  it("should return that dac is invalid", () => {
    const boletoNumber = "856900000584030100649158115347945609001374691358";
    
    expect(() => {
      validateConvenioDigits(boletoNumber)
    }).toThrow();
  });
});
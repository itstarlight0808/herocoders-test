const axios = require("axios");
const fs = require("fs");
const { startApp } = require("../app/index");

jest.mock("axios");

describe("startApp", () => {

  test("should fetch components and issues, and write output file", async () => {
    const componentsData = [{ id: 1 }, { id: 2 }];
    const issuesData = [{ id: 101 }, { id: 102 }];
    const componentsWithIssues = [{ id: 1, issues: [] }, { id: 2, issues: [] }];

    axios.get.mockResolvedValueOnce({ data: componentsData });
    axios.get.mockResolvedValueOnce({ data: { issues: issuesData } });
    const getComponentsWithIssues = jest.fn().mockImplementation((componentsData, issuesData) => componentsWithIssues);
    const writeFileSpy = jest.spyOn(fs, "writeFile");

    await startApp();

    expect(axios.get).toHaveBeenCalledWith("https://herocoders.atlassian.net/rest/api/3/project/SP/components");
    expect(axios.get).toHaveBeenCalledWith("https://herocoders.atlassian.net/rest/api/3/search?jql=project=SP");

    expect(writeFileSpy).toHaveBeenCalledWith(
      "./output/output.json",
      JSON.stringify(getComponentsWithIssues(componentsData, issuesData)),
      expect.any(Function)
    );
  });

  test("should handle write file error", async () => {
    // axios.get.mockResolvedOnce({ data: [] });
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.get.mockResolvedValueOnce({ data: { issues: [] } });

    const writeFileSpy = jest.spyOn(fs, "writeFile");
    const consoleLogSpy = jest.spyOn(console, "log");

    const error = new Error("Write file error");
    writeFileSpy.mockImplementationOnce((path, data, callback) => {
      callback(error);
    });

    await startApp();

    // expect(consoleLogSpy).toHaveBeenCalledWith("Output success!");
    expect(consoleLogSpy).toHaveBeenCalledWith("Error has occurred while output!", error);
  });
});
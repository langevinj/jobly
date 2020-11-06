const { it, expect } = require("@jest/globals");
const sqlForPartialUpdate = require("/Users/JeremyLangevin/Springboard/Unit_37/express-jobly/helpers/partialUpdate");

describe("partialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
    function () {
      const resp = sqlForPartialUpdate("testTable", {"count": 5}, "handle", 123)
      // FIXME: write real tests!
      expect(resp.query).toEqual(`UPDATE testTable SET count=$1 WHERE handle=$2 RETURNING *`);
      expect(resp.values).toEqual([5, 123])
    });
    
  it("should correctly increment variable identifiers with multiple fields",
    function(){
      const resp = sqlForPartialUpdate("testTable", { "count": 5, "name": "Test"}, "handle", 123)
      // FIXME: write real tests!
      expect(resp.query).toEqual(`UPDATE testTable SET count=$1, name=$2 WHERE handle=$3 RETURNING *`);
      expect(resp.values).toEqual([5, "Test", 123])
    })
});


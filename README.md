[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/koesterlab/datavzrd/CI)](https://github.com/koesterlab/datavzrd/actions)

# datavzrd
A tool to create visual and interactive HTML reports from collections of CSV/TSV tables. Reports include automatically generated vega-lite histograms per column. 
Plots can be fully customized by users via a config file. These also allow the user to add linkouts to other websites or link between multiple tables.

## Usage

```datavzrd config.yaml --output results/```

## Configuring datavzrd

datavzrd allows the user to easily customize it's interactive HTML report via a config file. 

```yaml
tables:
  table-a:
    path: "table-a.csv"
    render-columns:
      x:
        custom: |
          function(value) {
            return `<b>${value}</b>`;
          }
      y:
        link-to-url: 'https://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g={value}'
      z:
        link-to-table-row: table-b/gene
  table-b:
    path: table-b.csv
    separator: ;
    render-columns:
      gene:
        link-to-table: 'gene-{value}'
  gene-mycn:
    path: genes/table-mycn.csv
    page-size: 40
    header-rows: 2
```

### tables

`tables` consists of all different CSV/TSV tables that should be included in the resulting report. Each table definition can contain these values:

| keyword                           | explanation                                  | default |
|-----------------------------------|----------------------------------------------|---------|
| path                              | The path of the CSV/TSV file                 |         |
| separator                         | The delimiter of the file                    | ,       |
| page-size                         | Number of rows per page                      | 100     |
| header-rows                       | Number of header-rows of the file            | 1       |
| [render-columns](#render-columns) | Configuration of individual column rendering |         |

### render-columns 

`render-columns` contains individual configurations for each column that can either be adressed by its name defined in the header of the CSV/TSV file or its 0-based index (e.g. `index(5)` for the 6th column):

| keyword           | explanation                                                                                                 |
|-------------------|-------------------------------------------------------------------------------------------------------------|
| link-to-url       | Renders a link to the given url with {value} replace by the value of the table                              |
| link-to-table     | Renders as link to the given table, not a specific row                                                      |
| link-to-table-row | Renders as link to the other table highlighting the row in which the gene column has the same value as here |
| custom            | Applies the given js function to render column content                                                      |

## Authors

* [Johannes Köster](https://github.com/johanneskoester) (https://koesterlab.github.io)
* [Felix Wiegand](https://github.com/fxwiegand)

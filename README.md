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
    desc: |
      # A header
      This is the **description** for *table-a*.
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
      significance:
        custom-plot:
          data: |
            function(value) {
              return [{"significance": value, "threshold": value > 60}]
            }
          schema: |
            {
              "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
              "mark": "circle",
              "encoding": {
                "size": {"field": "significance", "type": "quantitative", "scale": {"domain": [0,100]}},
                "color": {"field": "threshold", "scale": {"domain": [true,false]}}
              },
              "config": {"legend": {"disable": true}}
            }
  gene-mycn:
    path: genes/table-mycn.csv
    page-size: 40
    header-rows: 2
    render-columns:
      frequency:
        plot:
          ticks:
            scale: linear
      quality:
        plot:
          heatmap:
            scale: linear
            range:
              - green
              - red
```

### tables

`tables` consists of all different CSV/TSV tables that should be included in the resulting report. Each table definition can contain these values:

| keyword                           | explanation                                                                                                                                 | default |
|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|---------|
| path                              | The path of the CSV/TSV file                                                                                                                |         |
| desc                              | A description that will be shown in the report. [Markdown](https://github.github.com/gfm/) is allowed and will be rendered to proper HTML.  |         | 
| separator                         | The delimiter of the file                                                                                                                   | ,       |
| page-size                         | Number of rows per page                                                                                                                     | 100     |
| header-rows                       | Number of header-rows of the file                                                                                                           | 1       |
| [render-columns](#render-columns) | Configuration of individual column rendering                                                                                                |         |

### render-columns 

`render-columns` contains individual configurations for each column that can either be adressed by its name defined in the header of the CSV/TSV file or its 0-based index (e.g. `index(5)` for the 6th column):

| keyword                           | explanation                                                                                                 |
|-----------------------------------|-------------------------------------------------------------------------------------------------------------|
| link-to-url                       | Renders a link to the given url with {value} replace by the value of the table                              |
| link-to-table                     | Renders as link to the given table, not a specific row                                                      |
| link-to-table-row                 | Renders as link to the other table highlighting the row in which the gene column has the same value as here |
| custom                            | Applies the given js function to render column content                                                      |
| [custom-plot](#custom-plot)       | Renders a custom vega-lite plot to the corresponding table cell                                             |
| [plot](#plot)                     | Renders a vega-lite plot defined with [plot](#plot) to the corresponding table cell                                          |

### custom-plot

`custom-plot` allows the rendering of customized vega-lite plots per cell.

| keyword       | explanation                                                                                          | default |
|---------------|------------------------------------------------------------------------------------------------------|---------|
| data          | A function to return the data needed for the schema (see below) from the content of the column cell  |         |
| schema        | A schema for a vega plot that is rendered into each cell of this column                              |         |
| vega-controls | Whether or not the resulting vega-lite plot is supposed to have action-links in the embedded view    | false   |

### plot

`plot` allows the rendering of either a [tick-plot](https://vega.github.io/vega-lite/docs/tick.html) for numeric values or a heatmap for nominal values.

| keyword                 | explanation                                                                                 |
|-------------------------|---------------------------------------------------------------------------------------------|
| [ticks](#ticks)         | Defines a [tick-plot](https://vega.github.io/vega-lite/docs/tick.html) for numeric values   |
| [heatmap](#heatmap)     | Defines a heatmap for numeric or nominal values                                             |

### ticks

`ticks` defines the attributes of a [tick-plot](https://vega.github.io/vega-lite/docs/tick.html) for numeric values.

| keyword   | explanation                                                                             |
|-----------|-----------------------------------------------------------------------------------------|
| scale     | Defines the [scale](https://vega.github.io/vega-lite/docs/scale.html) of the tick plot  |

### heatmap

`heatmap` defines the attributes of a heatmap for numeric or nominal values.

| keyword   | explanation                                                                                                    |
|-----------|----------------------------------------------------------------------------------------------------------------|
| scale     | Defines the [scale](https://vega.github.io/vega-lite/docs/scale.html) of the heatmap                           |
| scheme    | Defines the [scheme](https://vega.github.io/vega/docs/schemes/#categorical) of the heatmap for nominal values  |
| range     | Defines the color range of the heatmap as a list                                                  |

## Authors

* [Johannes Köster](https://github.com/johanneskoester) (https://koesterlab.github.io)
* [Felix Wiegand](https://github.com/fxwiegand)

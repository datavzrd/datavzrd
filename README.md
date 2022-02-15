[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/koesterlab/datavzrd/CI)](https://github.com/koesterlab/datavzrd/actions)

# datavzrd
A tool to create visual and interactive HTML reports from collections of CSV/TSV tables. Reports include automatically generated vega-lite histograms per column. 
Plots can be fully customized by users via a config file. These also allow the user to add linkouts to other websites or link between multiple tables.

## Usage

```datavzrd config.yaml --output results/```

## Configuring datavzrd

datavzrd allows the user to easily customize it's interactive HTML report via a config file. 

```yaml
name: My beautiful datvzrd report
datasets:
  table-a:
    path: "table-a.csv"
    links:
      gene details:
        column: gene
        item: "gene-{value}"
      gene expression:
        column: gene
        table-row: table-b/gene
  table-b:
    path: table-b.csv
    separator: ;
  gene-mycn:
    path: "genes/table-mycn.csv"
    header-rows: 2
    links:
      some expression:
        column: quality
        item: table-b
views:
  table-a:
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
  table-b:
    render-columns:
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
    dataset: gene-mycn
    page-size: 40
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
  gene-mycn-plot:
    dataset: gene-mycn
    pin-columns: 3
    render-plot:
      schema: |
        {
              "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
              "mark": "circle",
              "encoding": {
                "size": {"field": "significance", "type": "quantitative", "scale": {"domain": [0,100]}},
                "color": {"field": "threshold", "scale": {"domain": [true,false]}},
                "href": {"field": "some expression"}
              },
              "config": {"legend": {"disable": true}}
            }
```

### name

`name` allows the user to optionally set a name for the generated report that will be heading all resulting tables and plots.

### datasets

`datasets` defines the different datasets of the report. This is also the place to define links between your individual datasets.

| keyword                           | explanation                                                                                                                                 | default |
|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|---------|
| path                              | The path of the CSV/TSV file                                                                                                                |         |
| separator                         | The delimiter of the file                                                                                                                   | ,       |
| header-rows                       | Number of header-rows of the file                                                                                                           | 1       |
| [links](#links)                   | Configuration linking between items                                                                                                         |         |

### views

`views` consists of all different CSV/TSV views (table or plot) that should be included in the resulting report. If neither `render-table` nor `render-plot` is present, datavzrd will render the given file as a table. Each item definition can contain these values:

| keyword                           | explanation                                                                                                                                 | default |
|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------|---------|
| desc                              | A description that will be shown in the report. [Markdown](https://github.github.com/gfm/) is allowed and will be rendered to proper HTML.  |         |
| dataset                           | The name of the corresponding dataset to this view defined in [datasets](#datasets)                                                         |         |
| page-size                         | Number of rows per page                                                                                                                     | 100     |
| pin-columns                       | Number of columns that are fixed to the left side of the table and therefore always visible                                                 | 0       |
| [render-table](#render-table)     | Configuration of individual column rendering                                                                                                |         |
| [render-plot](#render-plot)       | Configuration of a single plot                                                                                                              |         |

### render-table 

`render-table` contains individual configurations for each column that can either be adressed by its name defined in the header of the CSV/TSV file or its 0-based index (e.g. `index(5)` for the 6th column):

| keyword                           | explanation                                                                                                 |
|-----------------------------------|-------------------------------------------------------------------------------------------------------------|
| link-to-url                       | Renders a link to the given url with {value} replace by the value of the table                              |
| custom                            | Applies the given js function to render column content                                                      |
| [custom-plot](#custom-plot)       | Renders a custom vega-lite plot to the corresponding table cell                                             |
| [plot](#plot)                     | Renders a vega-lite plot defined with [plot](#plot) to the corresponding table cell                         |

### render-plot

`render-plot` contains individual configurations for generating a single plot from the given CSV/TSV file.

| keyword                           | explanation                                                                                                 |
|-----------------------------------|-------------------------------------------------------------------------------------------------------------|
| schema                            | A schema for a vega plot that is rendered into each cell of this column                                     |

### links

`links` can configure linkouts between multiple items.

| column                            | The column that contains the value used for the linkout                                                          |
| table-row                         | Renders as a linkout to the other table highlighting the row in which the gene column has the same value as here |
| table                             | Renders as link to the given table, not a specific row                                                           |

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

[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/koesterlab/datavzrd/CI)](https://github.com/koesterlab/datavzrd/actions)
[![Conda Recipe](https://img.shields.io/badge/recipe-datavzrd-green.svg)](https://anaconda.org/conda-forge/datavzrd)
[![Conda Downloads](https://img.shields.io/conda/dn/conda-forge/datavzrd.svg)](https://anaconda.org/conda-forge/datavzrd)
[![Conda Version](https://img.shields.io/conda/vn/conda-forge/datavzrd.svg)](https://anaconda.org/conda-forge/datavzrd)

# datavzrd
A tool to create visual and interactive HTML reports from collections of CSV/TSV tables. Reports include automatically generated vega-lite histograms per column. 
Plots can be fully customized by users via a config file. These also allow the user to add linkouts to other websites or link between multiple tables. 
An example report can be [viewed online](https://koesterlab.github.io/datavzrd/index.html) with the [corresponding config file](https://github.com/koesterlab/datavzrd/tree/main/.examples/example-config.yaml).

## Usage

```datavzrd config.yaml --output results/```

## Configuring datavzrd

datavzrd allows the user to easily customize it's interactive HTML report via a config file.
When generating large reports, templating yaml files can be a bit tricky. We advise using [yte](https://github.com/koesterlab/yte) for easy yaml templating with python expressions.

```yaml
name: My beautiful datvzrd report
datasets:
  table-a:
    path: "table-a.csv"
    links:
      gene details:
        column: gene
        view: "gene-{value}"
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
        view: table-b
views:
  table-a:
    dataset: table-a
    desc: |
      # A header
      This is the **description** for *table-a*.
    render-table:
      x:
        custom: |
          function(value) {
            return `<b>${value}</b>`;
          }
      y:
        link-to-url: 'https://www.ensembl.org/Homo_sapiens/Gene/Summary?db=core;g={value}'
  table-b:
    dataset: table-b
    render-table:
      significance:
        optional: true
        custom-plot:
          data: |
            function(value) {
              return [{"significance": value, "threshold": value > 60}]
            }
          spec: |
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
    render-table:
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
      spec: |
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

| keyword                           | explanation                                                                                                 | default |
|-----------------------------------|-------------------------------------------------------------------------------------------------------------|---------|
| link-to-url                       | Renders a link to the given url with {value} replace by the value of the table. Other values of the same row can be accessed by their column header (e.g. {age} for a column named age).      |         |
| custom                            | Applies the given js function to render column content. The parameters of the function are similar to the ones defined [here](https://bootstrap-table.com/docs/api/column-options/#formatter) |         |
| [custom-plot](#custom-plot)       | Renders a custom vega-lite plot to the corresponding table cell                                             |         |
| [plot](#plot)                     | Renders a vega-lite plot defined with [plot](#plot) to the corresponding table cell                         |         |
| optional                          | Allows to have a column specified in render-table that is actually not present.                             | false   |

### render-plot

`render-plot` contains individual configurations for generating a single plot from the given CSV/TSV file.

| keyword                           | explanation                                                                                                 |
|-----------------------------------|-------------------------------------------------------------------------------------------------------------|
| spec                              | A schema for a vega lite plot that will be rendered to a single view                                        |
| spec-path                         | The path to a file containing a schema for a vega lite plot that will be rendered to a single view          |

### links

`links` can configure linkouts between multiple items.

| keyword                           | explanation                                                                                                      |
|-----------------------------------|------------------------------------------------------------------------------------------------------------------|
| column                            | The column that contains the value used for the linkout                                                          |
| table-row                         | Renders as a linkout to the other table highlighting the row in which the gene column has the same value as here |
| view                              | Renders as a link to the given view                                                                              |

### custom-plot

`custom-plot` allows the rendering of customized vega-lite plots per cell.

| keyword       | explanation                                                                                                | default |
|---------------|------------------------------------------------------------------------------------------------------------|---------|
| data          | A function to return the data needed for the schema (see below) from the content of the column cell        |         |
| spec          | The vega-lite spec for a vega plot that is rendered into each cell of this column                          |         |
| spec-path     | The path to a file containing a schema for a vega-lite plot that is rendered into each cell of this column |         |
| vega-controls | Whether or not the resulting vega-lite plot is supposed to have action-links in the embedded view          | false   |

### plot

`plot` allows the rendering of either a [tick-plot](https://vega.github.io/vega-lite/docs/tick.html) for numeric values or a heatmap for nominal values.

| keyword                 | explanation                                                                                 |
|-------------------------|---------------------------------------------------------------------------------------------|
| [ticks](#ticks)         | Defines a [tick-plot](https://vega.github.io/vega-lite/docs/tick.html) for numeric values   |
| [heatmap](#heatmap)     | Defines a heatmap for numeric or nominal values                                             |

### ticks

`ticks` defines the attributes of a [tick-plot](https://vega.github.io/vega-lite/docs/tick.html) for numeric values.

| keyword   | explanation                                                                                                                       |
|-----------|-----------------------------------------------------------------------------------------------------------------------------------|
| scale     | Defines the [scale](https://vega.github.io/vega-lite/docs/scale.html) of the tick plot                                            |
| domain    | Defines the domain of the tick plot. If not present datavzrd will automatically use the minimum and maximum values for the domain |

### heatmap

`heatmap` defines the attributes of a heatmap for numeric or nominal values.

| keyword      | explanation                                                                                                         |
|--------------|---------------------------------------------------------------------------------------------------------------------|
| scale        | Defines the [scale](https://vega.github.io/vega-lite/docs/scale.html) of the heatmap                                |
| color-scheme | Defines the [color-scheme](https://vega.github.io/vega/docs/schemes/#categorical) of the heatmap for nominal values |
| range        | Defines the color range of the heatmap as a list                                                                    |
| domain       | Defines the domain of the heatmap as a list                                                                         |

## Authors

* [Johannes Köster](https://github.com/johanneskoester) (https://koesterlab.github.io)
* [Felix Wiegand](https://github.com/fxwiegand)

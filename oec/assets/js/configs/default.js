function share(build){
  return function(){
    var lang = build.lang;
    var same_origin = window.parent.location.host == window.location.host;
    var url = encodeURIComponent("/"+lang+"/visualize/"+build.url)

    // make post request to server for short URL
    d3.json("/"+lang+"/visualize/shorten/")
      .header("Content-type","application/x-www-form-urlencoded")
      .post("url="+url, function(error, data) {
        if (data.error) {
          console.log(data.error)
        }
        else{
          d3.select("#short").style("display", "block")
          d3.selectAll(".modal#share input.short_url").property("value", "http://"+location.host+"/"+data.slug)
        }
      })
    // set embed link
    d3.select(".modal-body input.embed_code").property("value", '<iframe width="560" height="315" src="http://atlas.media.mit.edu/'+lang+'/visualize/embed/'+build.url+'?controls=false" frameborder="0" ></iframe>')
    // set social media link URLs
    d3.selectAll(".modal-body a#Facebook").attr("href", build.social.facebook)
    d3.selectAll(".modal-body a#Twitter").attr("href", build.social.twitter)
    d3.selectAll(".modal-body a#Google").attr("href", build.social.google)
    // open modal window
    d3.selectAll(".modal#share").classed("active", true);
    d3.selectAll("#mask").classed("visible", true);
    d3.selectAll("body").classed("frozen", true);
  }
}

configs.default = function(build, container) {

  /*  If we're looking at countries their icons are flags and we don't
      want to show the colored background because the flags don't take up
      100% of the icon square.

      Also we want to show RCA if we're looking at products. */
  if(build.attr_type == "dest" || build.attr_type == "origin"){
    var icon = {"value":"icon", "style":{"nest":"knockout","id":"default"}};
    var id_nesting = ["nest", "id"];
    var tooltip_data = ["display_id", build.trade_flow+"_val"];
  }
  else {
    var icon = {"value":"icon", "style":"knockout"};
    var tooltip_data = ["display_id", build.trade_flow+"_val", build.trade_flow+"_rca"]
    var id_nesting = ["nest", "nest_mid", "id"];
    if(build.attr_type == "sitc"){
      var id_nesting = ["nest","id"];
    }
  }

  var background = "none", curtain = "black", text = "#333333";
  if(window.parent.location.host == window.location.host){
    if (window.location.href.indexOf("/profile/") > 0) {
      background = d3.select(container.node().parentNode.parentNode.parentNode).style("background-color");
    }
    else if (window.parent.location !== window.location) {
      background = "#212831";
    }
    else {
      // background = "#212831";
      background = "#fff";
    }
    text = d3plus.color.text(background);
    curtain = background;
  }

  var edges = "#ddd",
      grid = "#ccc",
      missing = "#eee",
      chart = background,
      ui_color = oec.ui.light;

  if (background !== "none" && d3.hsl(background).l < 0.5) {
    missing = d3plus.color.lighter(background, 0.5);
    edges = d3plus.color.lighter(background, 0.2);
    grid = background;
    chart = d3plus.color.lighter(background, 0.1);
    // grid = "#a9a9a9";
    // chart = "#c3c3c3";

    ui_color = oec.ui.dark;
  }

  var large_tooltip_width = 150;
  if (window.location.href.indexOf("/visualize/") > 0 && window.innerWidth > 400) {
    large_tooltip_width = 250;
  }

  var tooltip = {
      "children": false,
      "curtain": {"color": curtain},
      "font": {
        "color": "#333"
      },
      "html": {
        "url": function(focus_id){
          var display_id = focus_id.substring(2).replace("_export", "").replace("_import", "");
          var attr_type = build.attr_type.indexOf("hs") >= 0 ? "prod_id" : build.attr_type+"_id";
          var url_args = "?classification="+build.classification+"&"+attr_type+"="+display_id+"&focus="+attr_type;
          ['origin', 'dest', 'prod'].forEach(function(filter){
            if(typeof build[filter] != "string"){
              url_args += "&"+filter+"_id="+build[filter].display_id;
            }
          })
          // console.log("/en/visualize/builds/"+url_args)
          return "/en/visualize/builds/"+url_args;
        },
        "callback":function(data){
          var buttons = [];
          data.builds.forEach(function(b){
            buttons.push("<a target='_top' href='/en/visualize/"+b.url+"' class='related'>"+b.title+"</a>");
          });
          buttons.push("<a style='background-color:"+d3plus.color.legible(data.profile.color)+";' target='_top' href='"+data.profile.url+"' class='profile'><img src='"+data.profile.icon+"' />"+data.profile.title+"</a>");
          return buttons.join("");
        }
      },
      "small": 200,
      "large": large_tooltip_width,
      "value": tooltip_data
    }

  return {
    "aggs": {
      "export_val_growth_pct": "mean",
      "export_val_growth_pct_5": "mean",
      "export_val_growth_val": "mean",
      "export_val_growth_val_5": "mean",
      "import_val_growth_pct": "mean",
      "import_val_growth_pct_5": "mean",
      "import_val_growth_val": "mean",
      "import_val_growth_val_5": "mean",
      "distance": "mean",
      "opp_gain": "mean",
      "pci": "mean",
      "eci": "mean",
      "export_rca": "mean",
      "import_rca": "mean"
    },
    "axes": {
      "background": {
        "color": chart,
        "stroke": {
          "color": grid
        }
      },
      "ticks": false
    },
    "background": background,
    "color": {
      "heatmap": ["#cccccc","#0085BF"],
      "missing": missing
    },
    "edges": {"color": edges},
    "focus": {"tooltip": false},
    "font": {
      "color": text
    },
    "format": {
      "number": function( number , key , vars ){
        var key = key.key;
        if(key && key.index){
          if(key.indexOf("pct") > -1){ return d3.format(".2%")(number); }
          if(key == "year"){ return number; }
        }
        var ret = d3plus.number.format( number , {"key":key, "vars":vars})
        if (key && ["export_val","import_val","net_export_val","net_import_val"].indexOf(key) >= 0) {
          ret = "$"+ret
        }
        return ret
      }
    },
    "icon": icon,
    "id": id_nesting,
    "labels": {
      "font": {
        "family": ["HelveticaNeue-CondensedBold", "HelveticaNeue-Condensed", "Helvetica-Condensed", "Arial Narrow", "sans-serif"],
        "weight": 800
      },
      "padding": 15
    },
    "legend": {"filters":true},
    "messages": {
      "branding": true,
      "font": {"color": text},
      "style": "large"
    },
    "size": {
      "value": build.trade_flow+"_val",
      "threshold": false
    },
    "text": {"nest":"name", "id":["name", "display_id"]},
    "time": {"value": "year", "solo": build.year },
    "title": {
      "font": {
        "color": text,
        "family": ["Montserrat", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        "weight": 400
      }
    },
    "tooltip": tooltip,
    "type": build.viz.slug,
    "ui": {
      "border": oec.ui.border,
      "color": ui_color,
      "font": {
        "color": text,
        "family": oec.ui.font.family,
        "size": oec.ui.font.size,
        "weight": oec.ui.font.weight
      },
      "margin": oec.ui.margin,
      "padding": oec.ui.padding
    },
    "x": {
      "grid": {
        "color": grid
      },
      "label": {
        "font": {
          "size": 16
        }
      },
      "ticks": {
        "color": grid
      }
    },
    "y": {
      "grid": {
        "color": grid
      },
      "label": {
        "font": {
          "size": 16
        }
      },
      "ticks": {
        "color": grid
      }
    }
  }

}
